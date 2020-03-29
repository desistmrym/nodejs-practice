module.exports = app => {
  const controller = require("../controllers/controllers.js");

//-----------------------------------API------------------------------------
//REGISTER WITH API
app.post("/api/register", controller.register);

//LOGIN WITH API
app.post("/api/login", controller.login);

//LOGOUT WITH API
app.get('/api/logout', controller.logoutAPI);

//INSERT TODOS WITH API
app.get('/api/viewtodo/:id', controller.viewtodo);

//CREATE TODOS WITH API
app.post('/api/tambahtodo/:id', controller.todosnew);

//UPDATE TODOS WITH API
app.put('/api/edittodo/:id', controller.edittodo);

//DELETE TODOS WITH API
app.delete('/api/deletetodo/:id', controller.deletetodo);

//INSERT USER WITH API
app.get('/api/user', controller.user);

//CREATE USER WITH API
app.post('/api/newUser', controller.newuser);

//UPDATE USER WITH API
app.put('/api/updateUser/:id', controller.updateuser);

//DELETE USER WITH API
app.delete('/api/deleteUser/:id', controller.deleteuser);

//------------------------------------VIEWS------------------------------------

//REGISTER WITH VIEWS
app.get('/signup', controller.signup);
app.post('/signup', controller.signup);

//LOGIN WITH VIEWS
app.get('/signin', controller.signin);
app.post('/signin', controller.signin);

//LOGOUT WITH VIEWS
app.get('/logout', controller.logout);

//DASHBOARD WITH VIEWS
app.get('/home', controller.home);
app.get('/beranda', controller.beranda);
app.get('/master', controller.master);

//-----------------TODO APP MASTER-----------------------
//CREATE TODOS
app.get('/master/new', controller.mastertodo);
app.post('/master/new', controller.mastertodo);

//UPDATE TODOS
app.get('/master/edit/:id', controller.edittodos);
app.post('/master/edit/:id', controller.updatetodos);

//DELETE TODOS
app.get('/master/hapus', controller.hapustodos);
app.get('/master/hapus/:id', controller.deletetodos);

//PROFIL MASTER
app.get('/master/profil', controller.profilmaster);

//UPDATE PROFIL MASTER
app.get('/master/edit', controller.editmaster);
app.post('/master/edit', controller.ubahmaster);

//MANAGE USER
//INSERT USER
app.get('/master/user', controller.users);

//CREATE USER
app.get('/user/new', controller.newuser);
app.post('/user/new', controller.newuser);

//EDIT USER
app.get('/user/edit/:id', controller.edituser);
app.post('/user/edit/:id', controller.updateuser);

//DELETE USER
app.get('/delete', controller.hapususer);
app.get('/delete/:id', controller.deleteuser);

//-----------------TODO APP USER-----------------------
//CREATE TODOS
app.get('/new', controller.new);
app.post('/new', controller.new);

//EDIT TODOS
app.get('/edit/:id', controller.edit);
app.post('/edit/:id', controller.ubah);

//DELETE TODOS
app.get('/hapus', controller.delete);
app.get('/hapus/:id', controller.hapus);

//PROFIL USER
//INSERT PROFIL
app.get('/home/profil', controller.profil);

//EDIT PROFIL
app.get('/profil/edit', controller.editprofil);
app.post('/profil/edit', controller.updateprofil);

};