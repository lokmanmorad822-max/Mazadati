let currentUser = null;

let selectedAuctionId = null;

let allAuctions = [];

let deleteModalLoaded = false;


$(document).ready(function () {

    loadCurrentUser();

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }


    loadModalComponent(
        'delete-modal.html',
        function () {

            deleteModalLoaded = true;

            console.log(
                'تم تحميل نافذة حذف المزاد بواسطة AJAX.'
            );

        }
    );


    loadProfile();


    $(document).on(
        'click',
        '#logoutButton',
        logoutUser
    );


    $(document).on(
        'click',
        '#confirmDeleteAuction',
        deleteAuction
    );

});


function loadCurrentUser() {

    currentUser = JSON.parse(
        localStorage.getItem(
            'mazadatiCurrentUser'
        )
    );

}


function loadProfile() {

    renderUserInfo();

    loadAuctions(function () {

        renderMyAuctions();

        renderMyBids();

        renderFavorites();

    });

}


function renderUserInfo() {

    $('#profileName').text(
        currentUser.name || 'مستخدم'
    );

    $('#profileEmail').text(
        currentUser.email || 'غير محدد'
    );

    $('#profilePhone').text(
        currentUser.phone || 'غير محدد'
    );

}


function loadAuctions(callback) {

    const userAuctions =
        JSON.parse(
            localStorage.getItem(
                'mazadatiUserAuctions'
            )
        ) || [];


    $.ajax({

        url: 'data/auctions.json',

        method: 'GET',

        dataType: 'json',

        success: function (data) {

            let staticAuctions = data;


            if (!Array.isArray(staticAuctions)) {

                staticAuctions =
                    Array.isArray(data.auctions)
                        ? data.auctions
                        : [];

            }


            allAuctions = [
                ...userAuctions,
                ...staticAuctions
            ];


            applyAuctionUpdates();


            callback();

        },


        error: function () {

            allAuctions = [
                ...userAuctions
            ];


            applyAuctionUpdates();


            callback();

        }

    });

}


function applyAuctionUpdates() {

    const updates =
        JSON.parse(
            localStorage.getItem(
                'mazadatiAuctionUpdates'
            )
        ) || {};


    allAuctions = allAuctions.map(
        function (auction) {

            const update =
                updates[String(auction.id)];


            if (!update) {
                return auction;
            }


            return {

                ...auction,

                currentPrice:
                    update.currentPrice !== undefined
                        ? update.currentPrice
                        : auction.currentPrice,


                bids:
                    update.bids !== undefined
                        ? update.bids
                        : auction.bids

            };

        }
    );

}


function renderMyAuctions() {

    const container =
        $('#myAuctionsContainer');


    const auctions =
        allAuctions.filter(function (auction) {

            return (
                String(auction.ownerId) ===
                String(currentUser.id)
            );

        });


    $('#myAuctionsCount').text(
        auctions.length
    );


    if (auctions.length === 0) {

        container.html(`

            <div class="col-12">

                <div class="profile-empty">

                    <i class="fa-solid fa-gavel"></i>

                    <h4>
                        لا توجد مزادات
                    </h4>

                    <p>
                        لم تقم بإضافة أي مزاد حتى الآن.
                    </p>

                    <a
                        href="add-auction.html"
                        class="btn btn-gold"
                    >
                        <i class="fa-solid fa-plus"></i>
                        أضف أول مزاد
                    </a>

                </div>

            </div>

        `);

        return;

    }


    container.empty();


    auctions.forEach(function (auction) {

        const image =
            auction.image ||
            'images/auction-placeholder.jpg';


        const price =
            Number(
                auction.currentPrice ||
                auction.price ||
                0
            );


        const bids =
            Number(
                auction.bids || 0
            );


        container.append(`

            <div class="col-lg-4 col-md-6">

                <div class="my-auction-card">

                    <div class="my-auction-image">

                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(
                                auction.title || ''
                            )}"
                        >

                    </div>


                    <div class="my-auction-body">

                        <span class="auction-category">
                            ${escapeHtml(
                                auction.category ||
                                'متنوع'
                            )}
                        </span>


                        <h4>
                            ${escapeHtml(
                                auction.title ||
                                'بدون عنوان'
                            )}
                        </h4>


                        <div class="my-auction-price">

                            <span>
                                السعر الحالي
                            </span>

                            <strong>
                                ${formatPrice(price)}
                                ريال
                            </strong>

                        </div>


                        <div class="my-auction-meta">

                            <span>
                                <i class="fa-solid fa-users"></i>
                                ${bids} مزايدة
                            </span>


                            <span>
                                ${escapeHtml(
                                    auction.status ||
                                    'نشط'
                                )}
                            </span>

                        </div>


                        <div class="my-auction-actions">

                            <a
                                href="auction-details.html?id=${auction.id}"
                                class="btn btn-sm btn-primary"
                            >
                                <i class="fa-solid fa-eye"></i>
                                عرض
                            </a>


                            <a
                                href="edit-auction.html?id=${auction.id}"
                                class="btn btn-sm btn-warning"
                            >
                                <i class="fa-solid fa-pen"></i>
                                تعديل
                            </a>


                            <button
                                type="button"
                                class="btn btn-sm btn-danger delete-auction-button"
                                data-id="${auction.id}"
                                data-title="${escapeHtml(
                                    auction.title || ''
                                )}"
                            >
                                <i class="fa-solid fa-trash"></i>
                                حذف
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `);

    });


    $(document).off(
        'click',
        '.delete-auction-button'
    );


    $(document).on(
        'click',
        '.delete-auction-button',
        function () {

            selectedAuctionId =
                String(
                    $(this).data('id')
                );


            const title =
                $(this).data('title');


            $('#deleteAuctionTitle').text(
                title
            );


            if (!deleteModalLoaded) {

                console.warn(
                    'نافذة الحذف لم يتم تحميلها بعد.'
                );

                return;

            }


            showAjaxModal(
                'deleteAuctionModal'
            );

        }
    );

}


function renderMyBids() {

    const container =
        $('#myBidsContainer');


    const bids =
        JSON.parse(
            localStorage.getItem(
                'mazadatiBids'
            )
        ) || [];


    const userBids =
        bids.filter(function (bid) {

            return (
                String(bid.userId) ===
                String(currentUser.id)
            );

        });


    $('#myBidsCount').text(
        userBids.length
    );


    if (userBids.length === 0) {

        container.html(`

            <div class="col-12">

                <div class="profile-empty">

                    <i class="fa-solid fa-hand-pointer"></i>

                    <h4>
                        لا توجد مزايدات
                    </h4>

                    <p>
                        لم تقم بالمزايدة على أي مزاد حتى الآن.
                    </p>

                    <a
                        href="auctions.html"
                        class="btn btn-gold"
                    >
                        <i class="fa-solid fa-gavel"></i>
                        تصفح المزادات
                    </a>

                </div>

            </div>

        `);

        return;

    }


    container.empty();


    userBids
        .slice()
        .reverse()
        .forEach(function (bid) {

            const auction =
                allAuctions.find(function (item) {

                    return (
                        String(item.id) ===
                        String(bid.auctionId)
                    );

                });


            const currentPrice =
                auction
                    ? Number(
                        auction.currentPrice ||
                        auction.price ||
                        0
                    )
                    : 0;


            const isHighest =
                auction &&
                Number(bid.amount) ===
                currentPrice;


            container.append(`

                <div class="col-lg-6">

                    <div class="profile-bid-item">

                        <div class="profile-bid-icon">

                            <i class="fa-solid fa-gavel"></i>

                        </div>


                        <div class="profile-bid-content">

                            <h5>
                                ${escapeHtml(
                                    bid.auctionTitle ||
                                    'مزاد'
                                )}
                            </h5>


                            <p>
                                مبلغ المزايدة:

                                <strong>
                                    ${formatPrice(
                                        bid.amount
                                    )}
                                    ريال
                                </strong>
                            </p>


                            <small>
                                ${formatDate(
                                    bid.createdAt
                                )}
                            </small>


                            ${
                                isHighest
                                    ? `
                                        <span class="badge bg-success mt-2">
                                            أعلى مزايدة حاليًا
                                        </span>
                                      `
                                    : ''
                            }

                        </div>


                        <a
                            href="auction-details.html?id=${bid.auctionId}"
                            class="btn btn-sm btn-outline-primary"
                        >
                            <i class="fa-solid fa-eye"></i>
                        </a>

                    </div>

                </div>

            `);

        });

}


function renderFavorites() {

    const container =
        $('#favoritesContainer');


    const favorites =
        JSON.parse(
            localStorage.getItem(
                'mazadatiFavorites'
            )
        ) || [];


    const userFavorites =
        favorites.filter(function (favorite) {

            return (
                String(favorite.userId) ===
                String(currentUser.id)
            );

        });


    $('#favoritesCount').text(
        userFavorites.length
    );


    if (userFavorites.length === 0) {

        container.html(`

            <div class="col-12">

                <div class="profile-empty">

                    <i class="fa-regular fa-heart"></i>

                    <h4>
                        لا توجد مزادات في المفضلة
                    </h4>

                    <p>
                        أضف المزادات التي تهمك إلى المفضلة.
                    </p>

                    <a
                        href="auctions.html"
                        class="btn btn-gold"
                    >
                        <i class="fa-solid fa-gavel"></i>
                        تصفح المزادات
                    </a>

                </div>

            </div>

        `);

        return;

    }


    container.empty();


    userFavorites.forEach(function (favorite) {

        const auction =
            allAuctions.find(function (item) {

                return (
                    String(item.id) ===
                    String(favorite.auctionId)
                );

            });


        if (!auction) {
            return;
        }


        const image =
            auction.image ||
            'images/auction-placeholder.jpg';


        const price =
            Number(
                auction.currentPrice ||
                auction.price ||
                0
            );


        container.append(`

            <div class="col-lg-4 col-md-6">

                <div class="my-auction-card">

                    <div class="my-auction-image">

                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(
                                auction.title || ''
                            )}"
                        >


                        <span class="favorite-card-icon">

                            <i class="fa-solid fa-heart"></i>

                        </span>

                    </div>


                    <div class="my-auction-body">

                        <span class="auction-category">
                            ${escapeHtml(
                                auction.category ||
                                'متنوع'
                            )}
                        </span>


                        <h4>
                            ${escapeHtml(
                                auction.title ||
                                'بدون عنوان'
                            )}
                        </h4>


                        <div class="my-auction-price">

                            <span>
                                السعر الحالي
                            </span>


                            <strong>
                                ${formatPrice(price)}
                                ريال
                            </strong>

                        </div>


                        <div class="my-auction-actions">

                            <a
                                href="auction-details.html?id=${auction.id}"
                                class="btn btn-sm btn-primary"
                            >
                                <i class="fa-solid fa-eye"></i>
                                عرض المزاد
                            </a>


                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger remove-favorite-button"
                                data-id="${auction.id}"
                            >
                                <i class="fa-solid fa-heart-crack"></i>
                                إزالة
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `);

    });


    $(document).off(
        'click',
        '.remove-favorite-button'
    );


    $(document).on(
        'click',
        '.remove-favorite-button',
        function () {

            const auctionId =
                String(
                    $(this).data('id')
                );


            removeFavorite(
                auctionId
            );

        }
    );

}


function removeFavorite(auctionId) {

    let favorites =
        JSON.parse(
            localStorage.getItem(
                'mazadatiFavorites'
            )
        ) || [];


    favorites =
        favorites.filter(function (favorite) {

            return !(
                String(favorite.auctionId) ===
                String(auctionId) &&

                String(favorite.userId) ===
                String(currentUser.id)
            );

        });


    localStorage.setItem(
        'mazadatiFavorites',
        JSON.stringify(favorites)
    );


    renderFavorites();

}


function deleteAuction() {

    if (!selectedAuctionId) {
        return;
    }


    let auctions =
        JSON.parse(
            localStorage.getItem(
                'mazadatiUserAuctions'
            )
        ) || [];


    const auction =
        auctions.find(function (item) {

            return (
                String(item.id) ===
                selectedAuctionId
            );

        });


    if (!auction) {

        hideAjaxModal(
            'deleteAuctionModal'
        );

        selectedAuctionId = null;

        return;

    }


    if (
        String(auction.ownerId) !==
        String(currentUser.id)
    ) {

        alert(
            'لا يمكنك حذف هذا المزاد.'
        );

        return;

    }


    auctions =
        auctions.filter(function (item) {

            return (
                String(item.id) !==
                selectedAuctionId
            );

        });


    localStorage.setItem(
        'mazadatiUserAuctions',
        JSON.stringify(auctions)
    );


    removeAuctionRelatedData(
        selectedAuctionId
    );


    hideAjaxModal(
        'deleteAuctionModal'
    );


    selectedAuctionId = null;


    loadProfile();

}


function removeAuctionRelatedData(
    auctionId
) {

    let favorites =
        JSON.parse(
            localStorage.getItem(
                'mazadatiFavorites'
            )
        ) || [];


    favorites =
        favorites.filter(function (item) {

            return (
                String(item.auctionId) !==
                String(auctionId)
            );

        });


    localStorage.setItem(
        'mazadatiFavorites',
        JSON.stringify(favorites)
    );


    let bids =
        JSON.parse(
            localStorage.getItem(
                'mazadatiBids'
            )
        ) || [];


    bids =
        bids.filter(function (item) {

            return (
                String(item.auctionId) !==
                String(auctionId)
            );

        });


    localStorage.setItem(
        'mazadatiBids',
        JSON.stringify(bids)
    );


    const updates =
        JSON.parse(
            localStorage.getItem(
                'mazadatiAuctionUpdates'
            )
        ) || {};


    delete updates[auctionId];


    localStorage.setItem(
        'mazadatiAuctionUpdates',
        JSON.stringify(updates)
    );

}


function logoutUser() {

    localStorage.removeItem(
        'mazadatiCurrentUser'
    );


    window.location.href =
        'index.html';

}


function formatPrice(price) {

    return Number(
        price || 0
    ).toLocaleString(
        'ar-YE'
    );

}


function formatDate(date) {

    if (!date) {
        return 'غير محدد';
    }


    const parsed =
        new Date(date);


    if (
        isNaN(
            parsed.getTime()
        )
    ) {

        return 'غير محدد';

    }


    return parsed.toLocaleDateString(
        'ar-YE',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    );

}


function escapeHtml(value) {

    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}