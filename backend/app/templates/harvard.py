TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ resume.personal_info.name }} - Resume</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, Georgia, serif;
            color: #000000;
            margin: {{ config.margin or '30px' }};
            padding: 0;
            line-height: 1.45;
            background-color: #ffffff;
            font-size: 13px;
        }
        .header {
            text-align: center;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 26px;
            font-weight: normal;
            letter-spacing: 0.5px;
        }
        .contact-info {
            font-size: 11px;
            color: #333333;
            font-style: italic;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
            border-bottom: 1px solid #000000;
            padding-bottom: 1px;
            margin-bottom: 8px;
            color: #000000;
        }
        .item {
            margin-bottom: 12px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
        }
        .item-sub {
            font-style: italic;
            margin-bottom: 2px;
        }
        ul {
            margin: 2px 0 0 0;
            padding-left: 18px;
        }
        li {
            margin-bottom: 2px;
            text-align: justify;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ resume.personal_info.name }}</h1>
        <div class="contact-info">
            <span>{{ resume.personal_info.location }}</span> | 
            <span>{{ resume.personal_info.phone }}</span> | 
            <span>{{ resume.personal_info.email }}</span>
            {% if resume.personal_info.linkedin %} | <span>{{ resume.personal_info.linkedin }}</span>{% endif %}
            {% if resume.personal_info.github %} | <span>{{ resume.personal_info.github }}</span>{% endif %}
        </div>
    </div>

    {% if resume.summary %}
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p style="margin: 0; text-align: justify;">{{ resume.summary }}</p>
    </div>
    {% endif %}

    {% if resume.experience %}
    <div class="section">
        <div class="section-title">Experience</div>
        {% for exp in resume.experience %}
        <div class="item">
            <div class="item-header">
                <span>{{ exp.company }}</span>
                <span>{{ exp.period }}</span>
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
                <span style="font-weight: normal; font-size: 11px; font-style: italic;">
                    Tech Stack: {{ proj.tech_stack | join(', ') }}
                </span>
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
        <div class="section-title">Technical Skills</div>
        <div style="font-size: 12px; line-height: 1.5;">
            {% if resume.skills.languages %}
            <div><strong>Languages:</strong> {{ resume.skills.languages | join(', ') }}</div>
            {% endif %}
            {% if resume.skills.frameworks %}
            <div><strong>Frameworks:</strong> {{ resume.skills.frameworks | join(', ') }}</div>
            {% endif %}
            {% if resume.skills.tools %}
            <div><strong>Tools & Platforms:</strong> {{ resume.skills.tools | join(', ') }}</div>
            {% endif %}
        </div>
    </div>
    {% endif %}

    {% if resume.education %}
    <div class="section">
        <div class="section-title">Education</div>
        {% for edu in resume.education %}
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
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
