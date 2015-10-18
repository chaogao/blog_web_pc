{% for item in blogs %}
    <div class="blog-detail">
        <h3 class="title"><a href="/blog/{{item.id}}">{{ item.title }}</a></h3>

        <div class="tag-list">
            {% for tagItem in item.tag %}
                <a class="label" href="/search/tag/{{ tagItem }}">{{ tagItem }}</a>
            {% endfor %}
        </div>

        <div class="info">
            <p>
                <a href="javascript:void(0);"><i class="glyphicon glyphicon-user"></i> {{ item.author }}</a>
            </p>

            <p>
                <span class="javascript:void(0);"><i class="glyphicon glyphicon-time"></i> {{ item.update_time|date('Y-m-d H:i:s', -480) }}</span>
            </p>
        </div>

        {% if (item.ext.bg) %}
            <div class="img-wrap">
                <img src="{{ item.ext.bg }}" onload="$(this).css('opacity',1);jsmod.util.stretchImg(this, $(this).parent().width(), $(this).parent().outerHeight(), true);">
            </div>
        {% endif %}

        <div class="desc">
            {{ item.description }}
        </div>
    </div>
{% endfor %}