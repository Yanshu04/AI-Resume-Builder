TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ resume.personal_info.name }} - Resume</title>
    <style>
        body {
            font-family: 'Century Gothic', sans-serif;
            color: #333333;
            margin: {{ config.margin or '20px' }};
            padding: 0;
            line-height: 1.4;
            background-color: #ffffff;
            font-size: 13px;
        }
        .header {
            border-bottom: 2px solid {{ config.accent_color or '#8C1515' }}; /* Stanford Cardinal Red */
            padding-bottom: 8px;
            margin-bottom: 18px;
        }
        .header h1 {
            margin: 0;
            font-size: 25px;
            color: {{ config.accent_color or '#8C1515' }};
            font-weight: bold;
        }
        .contact-info {
            font-size: 11px;
            color: #555555;
            margin-top: 4px;
        }
        .section {
            margin-bottom: 18px;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: {{ config.accent_color or '#8C1515' }};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .item {
            margin-bottom: 10px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            color: #111111;
        }
        .item-sub {
            font-size: 12px;
            color: #555555;
        }
        ul {
            margin: 2px 0 0 0;
            padding-left: 15px;
        }
        li {
            margin-bottom: 2px;
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
        <div class="section-title">Summary</div>
        <p style="margin: 0;">{{ resume.summary }}</p>
    </div>
    {% endif %}

    {% if resume.experience %}
    <div class="section">
        <div class="section-title">Experience</div>
        {% for exp in resume.experience %}
        <div class="item">
            <div class="item-header">
                <span>{{ exp.company }}</span>
                <span style="font-weight: normal; color: #666666; font-size: 11px;">{{ exp.period }}</span>
            </div>
            <div class="item-sub">{{ exp.position }}</div>
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
                <span style="font-weight: normal; color: #666666; font-size: 11px;">{{ proj.tech_stack | join(', ') }}</span>
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
        <div style="font-size: 12px;">
            {% if resume.skills.languages %}
            <div><strong>Languages:</strong> {{ resume.skills.languages | join(', ') }}</div>
            {% endif %}
            {% if resume.skills.frameworks %}
            <div><strong>Frameworks:</strong> {{ resume.skills.frameworks | join(', ') }}</div>
            {% endif %}
            {% if resume.skills.tools %}
            <div><strong>Tools:</strong> {{ resume.skills.tools | join(', ') }}</div>
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
                <strong>{{ edu.institution }}</strong> - 
                <span>{{ edu.degree }}</span>
            </div>
            <span>{{ edu.year }}</span>
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
