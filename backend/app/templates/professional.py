TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ resume.personal_info.name }} - Resume</title>
    <style>
        body {
            font-family: {{ config.font_family or 'Georgia, serif' }};
            color: {{ config.text_color or '#111111' }};
            margin: {{ config.margin or '25px' }};
            padding: 0;
            line-height: 1.4;
            background-color: #ffffff;
            font-size: 13px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 26px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
        }
        .contact-info {
            font-size: 11px;
            color: #444444;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid {{ config.accent_color or '#444444' }};
            padding-bottom: 2px;
            margin-bottom: 8px;
            color: {{ config.accent_color or '#111111' }};
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
            color: #444444;
            margin-bottom: 3px;
        }
        ul {
            margin: 2px 0 0 0;
            padding-left: 18px;
        }
        li {
            margin-bottom: 3px;
        }
        .skills-table {
            width: 100%;
            border-collapse: collapse;
        }
        .skills-table td {
            padding: 3px 0;
            vertical-align: top;
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
        <div class="section-title">Professional Experience</div>
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
        <div class="section-title">Technical Projects</div>
        {% for proj in resume.projects %}
        <div class="item">
            <div class="item-header">
                <span>{{ proj.name }}</span>
                <span style="font-weight: normal; font-style: italic; font-size: 11px;">
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
        <div class="section-title">Skills & Competencies</div>
        <table class="skills-table">
            {% if resume.skills.languages %}
            <tr>
                <td style="width: 120px; font-weight: bold;">Languages:</td>
                <td>{{ resume.skills.languages | join(', ') }}</td>
            </tr>
            {% endif %}
            {% if resume.skills.frameworks %}
            <tr>
                <td style="font-weight: bold;">Frameworks:</td>
                <td>{{ resume.skills.frameworks | join(', ') }}</td>
            </tr>
            {% endif %}
            {% if resume.skills.tools %}
            <tr>
                <td style="font-weight: bold;">Tools & Systems:</td>
                <td>{{ resume.skills.tools | join(', ') }}</td>
            </tr>
            {% endif %}
        </table>
    </div>
    {% endif %}

    {% if resume.education %}
    <div class="section">
        <div class="section-title">Education</div>
        {% for edu in resume.education %}
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <div>
                <span style="font-weight: bold;">{{ edu.institution }}</span> - 
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
