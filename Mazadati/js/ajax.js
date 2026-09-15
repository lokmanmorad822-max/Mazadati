function loadModalComponent(componentName, callback) {
    const modalContainer = $('#modalContainer');

    if (!modalContainer.length) {
        console.error('لم يتم العثور على #modalContainer');
        return;
    }

    $.ajax({
        url: `components/${componentName}`,
        method: 'GET',
        dataType: 'html',
        cache: false,

        success: function (html) {
            modalContainer.append(html);

            if (typeof callback === 'function') {
                callback();
            }
        },

        error: function (xhr, status, error) {
            console.error(
                `فشل تحميل المكون: ${componentName}`,
                status,
                error
            );
        }
    });
}


function loadModalComponents(components, callback) {
    let loadedCount = 0;

    if (!components || components.length === 0) {
        if (typeof callback === 'function') {
            callback();
        }

        return;
    }

    components.forEach(function (componentName) {

        loadModalComponent(componentName, function () {

            loadedCount++;

            if (loadedCount === components.length) {

                if (typeof callback === 'function') {
                    callback();
                }

            }

        });

    });
}


function showAjaxModal(modalId) {
    const modalElement = document.getElementById(modalId);

    if (!modalElement) {
        console.error(`لم يتم العثور على Modal: ${modalId}`);
        return;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.show();
}


function hideAjaxModal(modalId) {
    const modalElement = document.getElementById(modalId);

    if (!modalElement) {
        return;
    }

    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
        modal.hide();
    }
}