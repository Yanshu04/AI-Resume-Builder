TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ resume.personal_info.name }} - Resume</title>
    <style>
        body {
            font-family: {{ config.font_family or 'Inter, sans-serif' }};
            color: {{ config.text_color or '#222222' }};
            margin: {{ config.margin or '20px' }};
            padding: 0;
            line-height: 1.5;
            background-color: #ffffff;
            font-size: 14px;
        }
        .header {
            border-left: 6px solid {{ config.accent_color or '#C8F135' }};
            padding-left: 20px;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            font-size: 12px;
            color: #666666;
            margin-top: 8px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: {{ config.accent_color or '#C8F135' }};
            border-bottom: 2px solid #eeeeee;
            padding-bottom: 4px;
            margin-bottom: 12px;
        }
        .exp-item, .proj-item {
            margin-bottom: 15px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: 600;
        }
        .item-sub {
            font-size: 12px;
            color: #555555;
            margin-bottom: 4px;
        }
        ul {
            margin: 4px 0 0 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 4px;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
        }
        .skill-group-title {
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            color: #555555;
        }
        .tech-badge {
            display: inline-block;
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 4px;
            margin-top: 4px;
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
        <div class="exp-item">
            <div class="item-header">
                <span>{{ exp.position }}</span>
                <span style="font-weight: normal; color: #666666; font-size: 12px;">{{ exp.period }}</span>
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
        <div class="proj-item">
            <div class="item-header">
                <span>{{ proj.name }}</span>
                <span style="font-weight: normal; color: #666666; font-size: 12px;">
                    {% for tech in proj.tech_stack %}
                    <span class="tech-badge">{{ tech }}</span>
                    {% endfor %}
                </span>
            </div>
            <div class="item-sub" style="font-size: 12px; color: #777777;">{{ proj.description }}</div>
            <ul style="margin-top: 4px;">
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
        <div class="skills-grid">
            {% if resume.skills.languages %}
            <div>
                <div class="skill-group-title">Languages</div>
                <div style="font-size: 13px;">{{ resume.skills.languages | join(', ') }}</div>
            </div>
            {% endif %}
            {% if resume.skills.frameworks %}
            <div>
                <div class="skill-group-title">Frameworks</div>
                <div style="font-size: 13px;">{{ resume.skills.frameworks | join(', ') }}</div>
            </div>
            {% endif %}
            {% if resume.skills.tools %}
            <div>
                <div class="skill-group-title">Tools / Infrastructure</div>
                <div style="font-size: 13px;">{{ resume.skills.tools | join(', ') }}</div>
            </div>
            {% endif %}
        </div>
    </div>
    {% endif %}

    {% if resume.education %}
    <div class="section">
        <div class="section-title">Education</div>
        {% for edu in resume.education %}
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div>
                <span style="font-weight: 600;">{{ edu.institution }}</span> - 
                <span style="font-size: 13px;">{{ edu.degree }}</span>
            </div>
            <span style="font-size: 12px; color: #666666;">{{ edu.year }}</span>
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
