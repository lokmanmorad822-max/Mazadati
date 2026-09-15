$(document).ready(function () {

    loadFeaturedAuctions();

});

function loadFeaturedAuctions() {

    $.ajax({
        url: 'data/auctions.json',
        method: 'GET',
        dataType: 'json',

        success: function (auctions) {

            const container = $('#featuredAuctions');

            container.empty();

            auctions.slice(0, 3).forEach(function (auction) {

                const card = `
                    <div class="col-lg-4 col-md-6">

                        <div class="auction-card">

                            <div class="auction-image">

                                <img src="${auction.image}"
                                     alt="${auction.title}">

                                <span class="auction-status">
                                    ${auction.status}
                                </span>

                            </div>

                            <div class="auction-body">

                                <span class="auction-category">
                                    ${auction.category}
                                </span>

                                <h4 class="mt-2">
                                    ${auction.title}
                                </h4>

                                <div class="auction-price">

                                    <div>
                                        <small>السعر الحالي</small>
                                        <strong class="d-block">
                                            ${auction.price.toLocaleString()} ريال
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            ${auction.bids} مزايدات
                                        </small>
                                    </div>

                                </div>

                                <a href="auction-details.html?id=${auction.id}"
                                   class="btn btn-gold w-100 mt-3">
                                    مشاهدة المزاد
                                </a>

                            </div>

                        </div>

                    </div>
                `;

                container.append(card);

            });

        },

        error: function () {

            $('#featuredAuctions').html(`
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        حدث خطأ أثناء تحميل المزادات.
                    </div>
                </div>
            `);

        }
    });

}