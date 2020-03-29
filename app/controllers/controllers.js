const express                   = require('express');
const session                     = require('express-session');
const {check, validationResult} = require('express-validator');
const app                       = express();
const bcrypt                      = require('bcrypt');
const saltRounds                = 10;
let conn                      = require('../models/db.js')
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
})); 

//----------------------------------------------------------------API-------------------------------------------------------------------------------------//

//REGISTER WITH API
exports.register = [
    check('full_name').notEmpty(),
    check('no_tlp').isNumeric().notEmpty(),
    check('email').isEmail().notEmpty(),
    check('password').isLength({max: 8}).notEmpty(),
    function(req,res) {
    var post  = req.body;
    var name= post.email;
    var pass= post.password;
    var fname= post.full_name;
    var tlp= post.no_tlp;
    const errors = validationResult(req);
      
        bcrypt.hash(pass, saltRounds, function(err, hash){
        var sql = "INSERT INTO `users`(`full_name`,`no_tlp`,`email`, `password`, `role_user`) VALUES ('" + fname + "','" + tlp + "','" + name + "','" + hash + "', 'user')";
        
        conn.query(sql, function(err, results){ 
          if (!errors.isEmpty()) {
                return res.status(422).jsonp(errors.array());
          } else if(err) {
                console.log("error occured", error);
                res.send({
                    "code":400,
                    "failed": "error ocurred"
                });
          } else {
              console.log('The Solution is : ',results);
              res.send({
                  "code": 200,
                  "success": "user registered successfully"
              });
          }
      });
    });
  }
]

//LOGIN WITH API
exports.login = function(req,res){
    var post = req.body;
    var email= post.email;
    var password = post.password;
    conn.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
        const hash = results[0].password;
        bcrypt.compare(password, hash, (err, response) => {
            if(response === true){
                var role_user = results[0].role_user;
                var userId = results[0].id.toString()
                if (role_user === 'master'){
                    res.json({
                        message: "Berhasil Login sebagai MASTER", userId
                     })
                } else if(role_user == 'user'){
                    res.json({
                        message: "Berhasil Login sebagai USER", userId
                    })
                } else {
                    res.json({
                        message: "Email dan Password Salah", userId
                    })
                }
            }
        });
    });
}

//LOGOUT WITH API
exports.logoutAPI = (req, res) => {
    if(req.session.loggedIn) {
        req.session.destroy();
        res.status(200).send({message: "Logout Success"})
    } else {
        res.status(400).send({message: "Youre not Login"})
    }
};

//VIEW DATA WITH API
exports.viewtodo = (req, res) => {
    var userId = req.params.id;
    var sql="SELECT * FROM `list` WHERE `id_user`='"+userId+"'";          
    conn.query(sql, function(err, results){  
        res.send({results})
    });
}

//CREATE DATA WITH API
exports.todosnew = (req, res) => {
    var post  = req.body;
    var title = post.title;
    var userId = post.id_user;
  
    var sql = "INSERT INTO `list` (`title`, `id_user`) VALUES ('"+title+"', '"+userId+"')";
  
    conn.query(sql, function(err, result) {
        res.json({
          message: "Data berhasil ditambahkan!"
        })
    });
}

//UPDATE DATA WITH API
exports.edittodo = (req, res) => {
    var post = req.body;
    var Id = req.params.id;
    var title = post.title;
  
    var sql = "UPDATE `list` SET title='"+title+"' WHERE `id` = '"+Id+"'";
  
    conn.query(sql, function(err, result){
        res.json({
          message: "Berhasil di ubah"
        })
    });
}

//DELETE DATA WITH API
exports.deletetodo = (req, res) => {
    var ID = req.params.id;
  
    var sql = "DELETE FROM `list` WHERE `id` = '"+ID+"'";

    conn.query(sql, function(err, result){
        res.json({
          message: "Data Berhasil dihapus"
        })
    });
}

//VIEW USER WITH API
exports.user = (req, res) => {
    if(req.session.master) {
        conn.query("SELECT * FROM user WHERE role_user = 'user'", (err, results) => {
            if(err){
                console.log(err);
            } else {
                res.status(200).send(results);
            }
        });
    } else {
        res.status(400).send({message: 'Incorrect Data'});
    }
};

//CREATE USER WITH API
exports.userNew = (req, res) => {
    if(req.method == "POST"){
        var post  = req.body;
        var name= post.email;
        var pass= post.password;
        var fname= post.full_name;
        var tlp= post.no_tlp;
        var role_user = post.role_user;
        bcrypt.hash(pass, saltRounds, function(err, hash){
            var sql = "INSERT INTO `users`(`full_name`,`no_tlp`,`email`, `password`, `role_user`) VALUES ('" + fname + "','" + tlp + "','" + name + "','" + hash + "', '"+role_user+"')";
            var sql1 ="SELECT id, full_name, no_tlp, email FROM `users` WHERE `email`='"+name+"'";
            conn.query(sql1, function(err, results){      
                if(results.length){
                    res.status(400).send({message: "Email sudah terdaftar"});
                } else {
                    conn.query(sql, function(err, result) {
                        res.status(200).send({message: "User sudah terdaftar"});
                    });
                }
            });
        });
    } else {
       res.status(400).send({message: "Invalid Request"});
     }
}

//UPDATE USER WITH API
exports.updateUser = (req, res) => {
    if(req.method == "POST"){
        var post = req.body;
        var full_name = post.full_name;
        var no_tlp = post.no_tlp;
        var password = post.password;
        var userId = req.session.userId;
        var Id = req.params.id;
        bcrypt.hash(password, saltRounds, function(err, hash){
            var sql = "UPDATE `users` SET full_name='"+full_name+"', no_tlp='"+no_tlp+"', password='"+hash+"' WHERE `id` = '"+Id+"'";
            conn.query(sql, function(err, result){
                req.session.loggedIn = true;
                res.status(200).send({message: "Berhasil diupdate"})
             });
        });
    } else {
        res.status(400).send({message: "Invalid Request"});
    }
};

//DELETE USER WITH API
exports.deleteUser = (req, res) => {
    var ID = req.params.id;
    if(req.session.loggedIn){
        var sql = "DELETE FROM `users` WHERE `id` = '"+ID+"'";
        conn.query(sql, function(err, result){
            res.status(200).send({message: "Berhasil Dihapus"});
        });
    } else {
        res.status(400).send({message: "Anda Bukan Master"});
    }
};

//--------------------------------------------------------VIEWS----------------------------------------------------------------------------

//REGISTER WITH VIEWS
exports.signup = [
    check('full_name').notEmpty(),
    check('no_tlp').isNumeric().notEmpty(),
    check('email').isEmail().notEmpty(),
    check('password').isLength({max: 8}).notEmpty(),
  (req, res) => {
  message='';
  message1='';
  if(req.method === "POST"){
     let fname = req.body.full_name;
     let tlp = req.body.no_tlp;
     let name = req.body.email;
     let pass = req.body.password;
     const errors = validationResult(req);
     bcrypt.hash(pass, saltRounds, (err, hash) => {
        conn.query("SELECT * FROM users WHERE email='"+name+"'", function(err, results){  
            if (!errors.isEmpty()) {
                return res.status(422).jsonp(errors.array());    
            } else if(results.length){
                req.session.userId = results[0].id;
                req.session.email = results[0];
                message1 = "Email has been registered";
                res.render('signup.ejs',{message: message});
            } else {
                conn.query('INSERT INTO users(full_name,no_tlp,email,password,role_user) VALUES (?,?,?,?,?)',[fname,tlp,name,hash,'user'], (err, result) => {
                    message = "Succesfully! Your account has been created.";
                    res.render('signin.ejs',{message: message});
                });
            }
        });
    });
  } else {
      res.render('signup')
  }
}
]

//LOGIN WITH VIEWS
exports.signin = (req, res) => {
    var message = '';
    let name  = req.body.email;
    let pass  = req.body.password;
      if(req.method == "POST"){                          
        conn.query('SELECT id, email, password, role_user FROM `users` WHERE `email`= ?', [name], function(err, results, fields){                          
            const hash = results[0].password;
            bcrypt.compare(pass, hash, (err, response) => {
              let role_user = results[0].role_user;
              console.log(role_user);
                if(response === true){
                req.session.loggedIn = true;
                req.session.userId = results[0].id;
                req.session.email = name;
                    if (role_user === 'master'){
                        res.redirect('/master');
                    } else {
                        res.redirect('/home');
                    }
                } else {
                    message = 'Wrong Credentials.';
                    res.render('signin.ejs',{message: message});
                }
            });
        });      
    } else {
        if(req.session.loggedIn){
            res.redirect('/beranda');
        } else {
            res.render('signin.ejs', {message: message});
        }
    } 
};

//LOGOUT WITH VIEWS
exports.logout = function(req,res){
    req.session.destroy(function(err) {
       res.redirect("/signin");
    });
};

//DASHBOARD USER WITH VIEWS
//get home nanti redirect beranda
exports.home = function(req, res){
    if(req.session.loggedIn){
        res.redirect('/beranda');
    } else {
        res.redirect('/signin');
    }
    res.end();
}

//get user by id after login
exports.beranda = function(req, res){
    var userId = req.session.userId;
    if(req.session.loggedIn){
      var sql="SELECT * FROM `list` WHERE `id_user`='"+userId+"'";  
      conn.query(sql, function(err, results){
        console.log(results); 
        res.render('home.ejs', {data: results});
      });
    } else {
      res.redirect('/signin');
    }
}

//CRUD TODOAPP USER
//CREATE
exports.new = function(req, res){
    if(req.method == "POST"){
        var post  = req.body;
        var title = post.title;
        var userId = req.session.userId;
        var sql = "INSERT INTO `list` (`title`, `id_user`) VALUES ('"+title+"', '"+userId+"')";
    
        conn.query(sql, function(err, result) {
            res.redirect('/home');
        });
    } else {
        if(req.session.loggedIn){
            res.render('User/create.ejs')
        } else {
            res.redirect('/signin'); 
      }
    }
}

//GET UPDATE
exports.edit = function(req, res){
    var userId = req.session.userId;
    var Id = req.params.id;
    if(req.session.loggedIn){  
      var sql = "SELECT * FROM `list` WHERE `id` = '"+Id+"'";
        conn.query(sql, function(err, result){
            console.log(result);
            res.render('User/ubah.ejs', {data:result});
        });
    } else {
      res.redirect('/signin');
    }
}

//POST UPDATE
exports.ubah = function(req, res){
    if(req.session.loggedIn){
        var post = req.body;
        var Id = req.params.id;
        var title = post.title;
        var sql = "UPDATE `list` SET title='"+title+"' WHERE `id` = '"+Id+"'";
  
        conn.query(sql, function(err, result){
            res.redirect('/home');
        });
    } else {
      res.redirect('/signin');
    }
}

//GET DELETE
exports.delete = function(req, res){
    var userId = req.session.userId;
    if(req.session.loggedIn){
        var sql = "SELECT * FROM `list` WHERE `id_user` = '"+userId+"'";
        conn.query(sql, function(err, result){
            res.render('User/hapus.ejs', {data:result});
        });
    } else {
      res.redirect("/signin");
    }
}

//ACTION DELETE TODOS USER WITH VIEWS 
exports.hapus = function(req, res){
    if(req.session.loggedIn){
        var ID = req.params.id;
        var sql = "DELETE FROM `list` WHERE `id` = '"+ID+"'";
        conn.query(sql, function(err, result){
            res.redirect('/home');
        });
    } else {
      res.redirect('/signin');
    }
}

//PROFIL USER WITH VIEWS
//get profil user
exports.profil = function(req, res){
    var userId = req.session.userId;
    if(userId == null){
       res.redirect("/home");
       return;
    }
    var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
        conn.query(sql, function(err, results){  
            res.render('User/profil.ejs',{data:results});
        });
};

//get edit profil user
exports.editprofil = (req, res) => {
    var userId = req.session.userId;
    if(userId == null){
       res.redirect("/home");
       return;
    }
      var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
      conn.query(sql, function(err, results){  
        console.log(results);
        res.render('User/editprofil.ejs',{data:results});
    });
}

//post edit profil user
exports.updateprofil = (req, res) => {
    if(req.method == "POST"){
        var post = req.body;
        var full_name = post.full_name;
        var no_tlp = post.no_tlp;
        var password = post.password;
        var userId = req.session.userId;
        bcrypt.hash(password, saltRounds, function(err, hash){
            var sql = "UPDATE `users` SET full_name='"+full_name+"', no_tlp='"+no_tlp+"', password='"+hash+"' WHERE `id` = '"+userId+"'";
                conn.query(sql, function(err, result){
                    console.log(sql);
                    req.session.loggedIn = true;
                    res.redirect('/home/profil');
            });
         });
    } else {
      if(req.session.loggedIn){
        res.redirect('/home')
      }
      res.redirect('/signin');
    }
}

//GET DASHBOARD MASTER WITH VIEWS
exports.master = function(req, res){
    var userId = req.session.userId;
    if(req.session.loggedIn){
        var sql="SELECT * FROM `list` WHERE `id_user`='"+userId+"'";  
        conn.query(sql, function(err, results){
            res.render('Master/master.ejs', {data: results});
        });
    } else {
      res.redirect('/signin');
    }
}
  
//CREATE TODOS MASTER WITH VIEWS
exports.mastertodo = (req, res) => {
    if(req.method == "POST"){
        var post  = req.body;
        var title = post.title;
        var userId = req.session.userId;
        var sql = "INSERT INTO `list` (`title`, `id_user`) VALUES ('"+title+"', '"+userId+"')";
        conn.query(sql, function(err, result) {
            res.redirect('/master');
        });
    } else {
        if(req.session.loggedIn){
            res.render('Master/newmaster.ejs')
        } else {
            res.redirect('/signin'); 
        }
    }
}

//GET EDIT TODOS MASTER WITH VIEWS
exports.edittodos = (req, res) => {
    var userId = req.session.userId;
    var Id = req.params.id;
    if(req.session.loggedIn){
        var sql = "SELECT * FROM `list` WHERE `id` = '"+Id+"'";
        conn.query(sql, function(err, result){
            res.render('Master/edittodos.ejs', {data:result});
        });
    } else {
      res.redirect('/signin');
    }
}

//ACTION POST UPDATE TODOS MASTER WITH VIEWS
exports.updatetodos = (req, res) => {
    if(req.session.loggedIn){
        var post = req.body;
        var Id = req.params.id;
        var title = post.title;
        var sql = "UPDATE `list` SET title='"+title+"' WHERE `id` = '"+Id+"'";
        conn.query(sql, function(err, result){
            res.redirect('/master');
        });
    } else {
      res.redirect('/signin');
    }
}

//GET DELETE TODOS MASTER WITH VIEWS
exports.hapustodos = (req, res) => {
    var userId = req.session.userId;
    if(req.session.loggedIn){
        var sql = "SELECT * FROM `list` WHERE `id_user` = '"+userId+"'";
        conn.query(sql, function(err, result){
            res.render('Master/hapustodos.ejs', {data:result});
        });
    } else {
      res.redirect("/signin");
    }
}

//ACTION DELETE TODOS MASTER WITH VIEWS
exports.deletetodos = (req, res) => {
    if(req.session.loggedIn){
        var ID = req.params.id;
        var sql = "DELETE FROM `list` WHERE `id` = '"+ID+"'";
        conn.query(sql, function(err, result){
            res.redirect('/master');
        });
    } else {
      res.redirect('/signin');
    }
}
  
//GET PROFIL MASTER WITH VIEWS
exports.profilmaster = function(req, res){
    var userId = req.session.userId;
    if(userId == null){
       res.redirect("/master");
       return;
    }
    var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
    conn.query(sql, function(err, results){  
        res.render('Master/profilmaster.ejs',{data:results});
    });
}
  
//GET EDIT MASTER WITH VIEWS
exports.editmaster = function(req, res){
    var userId = req.session.userId;
    if(req.session.loggedIn){
        var sql = "SELECT * FROM `users` WHERE `id` = '"+userId+"'";
        conn.query(sql, function(err, result){
            res.render('Master/editmaster.ejs', {data:result});
        });
    } else {
      res.redirect('/signin');
    }
}

//POST UPDATE MASTER WITH VIEWS
exports.ubahmaster = function(req, res){
    if(req.method == "POST"){
        var post = req.body;
        var full_name = post.full_name;
        var no_tlp = post.no_tlp;
        var password = post.password;
        var userId = req.session.userId;
        bcrypt.hash(password, saltRounds, function(err, hash){
            var sql = "UPDATE `users` SET full_name='"+full_name+"', no_tlp='"+no_tlp+"', password='"+hash+"' WHERE `id` = '"+userId+"'";
            conn.query(sql, function(err, result){
                req.session.loggedIn = true;
                res.redirect('/master/profil');
            });
         });
    } else {
        if(req.session.loggedIn){
            res.redirect('master/')
        }
            res.redirect('/signin');
    }
}     

//GET DATA USER WITH VIEWS
exports.users = function(req, res){
    var userId = req.session.userId;
    if(userId == null){
       res.redirect("/master");
       return;
    }
    var sql="SELECT * FROM `users`";          
    conn.query(sql, function(err, results){  
        res.render('Master/user.ejs',{data:results});
    });
}

//CREATE USER WITH VIEWS
exports.newuser = function(req, res){
    if(req.method == "POST"){
        var post  = req.body;
        var name= post.email;
        var pass= post.password;
        var fname= post.full_name;
        var tlp= post.no_tlp;
        var role_user = post.role_user;
        bcrypt.hash(pass, saltRounds, function(err, hash){
            var sql = "INSERT INTO `users`(`full_name`,`no_tlp`,`email`, `password`, `role_user`) VALUES ('" + fname + "','" + tlp + "','" + name + "','" + hash + "', '"+role_user+"')";
            var sql1 ="SELECT id, full_name, no_tlp, email FROM `users` WHERE `email`='"+name+"'";
            conn.query(sql1, function(err, results){      
                if(results.length){
                    req.session.userId = results[0].id;
                    req.session.email = results[0];
                    message = "Email has been registered";
                    res.render('Master/tambahuser.ejs',{message: message});
                } else {
                    conn.query(sql, function(err, result) {
                        message = "Succesfully! Your account has been created.";
                        res.render('Master/tambahuser.ejs',{message: message});
                    });
                }
            });
        });
    } else {
       res.render('Master/tambahuser.ejs')
     }
};

//GET UPDATE USER WITH VIEWS
exports.edituser = (req, res) => {
    var userId = req.session.userId;
    var Id = req.params.id;
    if(req.session.loggedIn){
      var sql = "SELECT * FROM `users` WHERE `id` = '"+Id+"'";
        conn.query(sql, function(err, result){
            res.render('Master/edituser.ejs', {data:result});
        });
    } else {
      res.redirect('/signin');
    }
}

//POST UPDATE USER WITH VIEWS  
exports.updateuser = (req, res) => {
    if(req.method == "POST"){
        var post = req.body;
        var full_name = post.full_name;
        var no_tlp = post.no_tlp;
        var password = post.password;
        var userId = req.session.userId;
        var Id = req.params.id;
        bcrypt.hash(password, saltRounds, function(err, hash){
            var sql = "UPDATE `users` SET full_name='"+full_name+"', no_tlp='"+no_tlp+"', password='"+hash+"' WHERE `id` = '"+Id+"'";
            conn.query(sql, function(err, result){
                req.session.loggedIn = true;
                res.redirect('/master/user');
             });
        });
    } else {
        if(req.session.loggedIn){
            res.redirect('master/')
        }
            res.redirect('/signin');
    }
}

//GET DELETE USER WITH VIEWS
exports.hapususer = (req, res) => {
    var userId = req.session.userId;
    if(req.session.loggedIn){
        var sql = "SELECT * FROM `users`";
        conn.query(sql, function(err, result){
            res.render('Master/hapususer.ejs', {data:result});
        });
    } else {
      res.redirect("/signin");
    }
}

//ACTION DELETE USER WITH VIEWS
exports.deleteuser = (req, res) => {
    var ID = req.params.id;
    if(req.session.loggedIn){
        var sql = "DELETE FROM `users` WHERE `id` = '"+ID+"'";
        conn.query(sql, function(err, result){
            res.redirect('/master/user');
        });
    } else {
      res.redirect('/signin');
    }
}

