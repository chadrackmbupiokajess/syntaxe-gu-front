from django.contrib import admin
from .models import Section, Departement, Auditoire, Course, CourseAssignment

# Register your models here.
admin.site.register(Section)
admin.site.register(Departement)
admin.site.register(Auditoire)
admin.site.register(Course)
admin.site.register(CourseAssignment)
