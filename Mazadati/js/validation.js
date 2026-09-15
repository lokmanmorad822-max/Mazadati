$(document).ready(function () {

    initRegisterValidation();

    initLoginValidation();

    initPasswordToggle();

});


function initRegisterValidation() {

    $('#registerForm').on('submit', function (event) {

        event.preventDefault();

        const name = $('#registerName').val().trim();
        const email = $('#registerEmail').val().trim();
        const phone = $('#registerPhone').val().trim();
        const password = $('#registerPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        const terms = $('#terms').is(':checked');

        let valid = true;


        if (name.length < 3) {

            setInvalid('#registerName');

            valid = false;

        } else {

            setValid('#registerName');

        }


        if (!isValidEmail(email)) {

            setInvalid('#registerEmail');

            valid = false;

        } else {

            setValid('#registerEmail');

        }


        if (phone.length < 7) {

            setInvalid('#registerPhone');

            valid = false;

        } else {

            setValid('#registerPhone');

        }


        if (password.length < 6) {

            setInvalid('#registerPassword');

            valid = false;

        } else {

            setValid('#registerPassword');

        }


        if (
            confirmPassword.length < 6 ||
            confirmPassword !== password
        ) {

            setInvalid('#confirmPassword');

            valid = false;

        } else {

            setValid('#confirmPassword');

        }


        if (!terms) {

            $('#terms')
                .addClass('is-invalid');

            valid = false;

        } else {

            $('#terms')
                .removeClass('is-invalid');

        }


        if (!valid) {

            showRegisterMessage(
                'يرجى تصحيح البيانات المطلوبة.',
                'danger'
            );

            return;

        }


        const users =
            JSON.parse(
                localStorage.getItem('mazadatiUsers')
            ) || [];


        const existingUser =
            users.find(function (user) {

                return user.email === email;

            });


        if (existingUser) {

            showRegisterMessage(
                'هذا البريد الإلكتروني مسجل مسبقًا.',
                'warning'
            );

            return;

        }


        const newUser = {

            id: Date.now(),

            name: name,

            email: email,

            phone: phone,

            password: password

        };


        users.push(newUser);


        localStorage.setItem(
            'mazadatiUsers',
            JSON.stringify(users)
        );


        showRegisterMessage(
            'تم إنشاء الحساب بنجاح. سيتم تحويلك إلى تسجيل الدخول.',
            'success'
        );


        $('#registerForm')[0].reset();


        setTimeout(function () {

            window.location.href = 'login.html';

        }, 1500);

    });

}


function initLoginValidation() {

    $('#loginForm').on('submit', function (event) {

        event.preventDefault();

        const email =
            $('#loginEmail').val().trim();

        const password =
            $('#loginPassword').val();


        let valid = true;


        if (!isValidEmail(email)) {

            setInvalid('#loginEmail');

            valid = false;

        } else {

            setValid('#loginEmail');

        }


        if (password.length === 0) {

            setInvalid('#loginPassword');

            valid = false;

        } else {

            setValid('#loginPassword');

        }


        if (!valid) {

            showLoginMessage(
                'يرجى إدخال بيانات تسجيل الدخول بشكل صحيح.',
                'danger'
            );

            return;

        }


        const users =
            JSON.parse(
                localStorage.getItem('mazadatiUsers')
            ) || [];


        const user =
            users.find(function (item) {

                return (
                    item.email === email &&
                    item.password === password
                );

            });


        if (!user) {

            showLoginMessage(
                'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
                'danger'
            );

            return;

        }


        localStorage.setItem(
            'mazadatiCurrentUser',
            JSON.stringify(user)
        );


        showLoginMessage(
            `مرحبًا ${user.name}، تم تسجيل الدخول بنجاح.`,
            'success'
        );


        setTimeout(function () {

            window.location.href = 'profile.html';

        }, 1000);

    });

}


function initPasswordToggle() {

    $('#togglePassword').on('click', function () {

        const input = $('#loginPassword');

        const icon = $(this).find('i');


        if (input.attr('type') === 'password') {

            input.attr('type', 'text');

            icon.removeClass('fa-eye');
            icon.addClass('fa-eye-slash');

        } else {

            input.attr('type', 'password');

            icon.removeClass('fa-eye-slash');
            icon.addClass('fa-eye');

        }

    });

}


function isValidEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}


function setInvalid(selector) {

    $(selector)
        .addClass('is-invalid')
        .removeClass('is-valid');

}


function setValid(selector) {

    $(selector)
        .removeClass('is-invalid')
        .addClass('is-valid');

}


function showRegisterMessage(message, type) {

    $('#registerMessage').html(`

        <div class="alert alert-${type}">
            ${message}
        </div>

    `);

}


function showLoginMessage(message, type) {

    $('#loginMessage').html(`

        <div class="alert alert-${type}">
            ${message}
        </div>

    `);

}