(function () {
    var base = {
        init: function () {
            this.initImg();
        },
        initImg: function () {
            var img = $(".img-wrap img");

            img.each(function () {
                $(this).prop("src", $(this).data("src"));
            });
        }
    };


    $(document).ready(function () {
        base.init();
    });
})();