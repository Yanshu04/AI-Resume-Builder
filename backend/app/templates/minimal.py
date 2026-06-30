TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ resume.personal_info.name }} - Resume</title>
    <style>
        body {
            font-family: {{ config.font_family or 'system-ui, sans-serif' }};
            color: {{ config.text_color or '#333333' }};
            margin: {{ config.margin or '30px' }};
            padding: 0;
            line-height: 1.6;
            background-color: #ffffff;
            font-size: 13px;
        }
        .header {
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
            color: #111111;
        }
        .contact-info {
            font-size: 11px;
            color: #888888;
            margin-top: 4px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #777777;
            margin-bottom: 10px;
        }
        .item {
            margin-bottom: 15px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: 500;
            color: #111111;
        }
        .item-sub {
            font-size: 11px;
            color: #777777;
        }
        ul {
            margin: 4px 0 0 0;
            padding-left: 15px;
            color: #444444;
        }
        li {
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ resume.personal_info.name }}</h1>
        <div class="contact-info">
            <span>{{ resume.personal_info.email }}</span> | 
            <span>{{ resume.personal_info.phone }}</span> | 
            <span>{{ resume.personal_info.location }}</span>
            {% if resume.personal_info.linkedin %} | <span>{{ resume.personal_info.linkedin }}</span>{% endif %}
            {% if resume.personal_info.github %} | <span>{{ resume.personal_info.github }}</span>{% endif %}
        </div>
    </div>

    {% if resume.summary %}
    <div class="section">
        <div class="section-title">Profile</div>
        <p style="margin: 0; color: #444444;">{{ resume.summary }}</p>
    </div>
    {% endif %}

    {% if resume.experience %}
    <div class="section">
        <div class="section-title">Experience</div>
        {% for exp in resume.experience %}
        <div class="item">
            <div class="item-header">
                <span>{{ exp.position }}</span>
                <span style="font-weight: normal; color: #888888; font-size: 11px;">{{ exp.period }}</span>
            </div>
            <div class="item-sub">{{ exp.company }}</div>
            <ul>
                {% for bullet in exp.bullets %}
                <li>{{ bullet }}</li>
                {% endfor %}
            </ul>
        </div>
        {% endfor %}
    </div>
    {% endif %}

    {% if resume.projects %}
    <div class="section">
        <div class="section-title">Projects</div>
        {% for proj in resume.projects %}
        <div class="item">
            <div class="item-header">
                <span>{{ proj.name }}</span>
                <span style="font-weight: normal; color: #888888; font-size: 11px;">{{ proj.tech_stack | join(', ') }}</span>
            </div>
            <div class="item-sub">{{ proj.description }}</div>
            <ul>
                {% for bullet in proj.bullets %}
                <li>{{ bullet }}</li>
                {% endfor %}
            </ul>
        </div>
        {% endfor %}
    </div>
    {% endif %}

    {% if resume.skills %}
    <div class="section">
        <div class="section-title">Skills</div>
        <div style="color: #444444;">
            {% if resume.skills.languages %}
            <div style="margin-bottom: 4px;"><strong style="font-weight: 500; color: #111111;">Languages:</strong> {{ resume.skills.languages | join(', ') }}</div>
            {% endif %}
            {% if resume.skills.frameworks %}
            <div style="margin-bottom: 4px;"><strong style="font-weight: 500; color: #111111;">Frameworks:</strong> {{ resume.skills.frameworks | join(', ') }}</div>
            {% endif %}
            {% if resume.skills.tools %}
            <div><strong style="font-weight: 500; color: #111111;">Tools:</strong> {{ resume.skills.tools | join(', ') }}</div>
            {% endif %}
        </div>
    </div>
    {% endif %}

    {% if resume.education %}
    <div class="section">
        <div class="section-title">Education</div>
        {% for edu in resume.education %}
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <div>
                <span style="font-weight: 500; color: #111111;">{{ edu.institution }}</span> - 
                <span style="color: #444444;">{{ edu.degree }}</span>
            </div>
            <span style="color: #888888; font-size: 11px;">{{ edu.year }}</span>
        </div>
        {% endfor %}
    </div>
    {% endif %}

    {% if resume.achievements %}
    <div class="section">
        <div class="section-title">Achievements</div>
        <ul>
            {% for ach in resume.achievements %}
            <li>{{ ach }}</li>
            {% endfor %}
        </ul>
    </div>
    {% endif %}
</body>
</html>
"""
