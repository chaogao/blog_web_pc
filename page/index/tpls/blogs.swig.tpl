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
            <a class="img-wrap" href="/blog/{{item.id}}">
                <img src="{{ item.ext.bg }}" onload="$(this).css('opacity',1);jsmod.util.stretchImg(this, $(this).parent().width(), $(this).parent().outerHeight(), true);">
            </a>
        {% endif %}

        <div class="desc markdown-body">
            {{ item.content_html_lite|safe }}
        </div>

        <div class="action">
            <a href="/blog/{{item.id}}">阅读全文 <i class="glyphicon glyphicon-forward"></i></a>
        </div>
    </div>
{% endfor %}