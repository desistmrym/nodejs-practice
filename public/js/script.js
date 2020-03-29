$('#signup-btn').click(function () {
    $.ajax({
      url: '/sigunp',
      type: 'POST',
      cache: false,
      data: {
        full_name: $('#name').val(),
        no_tlp: $('#classYear').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        confirmPassword: $('#confirmPassword').val()
      },
      success: function () {
        $('#error-group').css('display', 'none');
        alert('Your submission was successful');
      },
      error: function (data) {
        $('#error-group').css('display', 'block');
        var errors = JSON.parse(data.responseText);
        var errorsContainer = $('#errors');
        errorsContainer.innerHTML = '';
        var errorsList = '';
  
        for (var i = 0; i < errors.length; i++) {
          errorsList += '<li>' + errors[i].msg + '</li>';
        }
        errorsContainer.html(errorsList);
      }
    });
  });