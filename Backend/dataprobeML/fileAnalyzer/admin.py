from django.contrib import admin
from fileAnalyzer.models import Review

# Register your models here.
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description', 'date', 'review' , 'reviewModes', 'bleuScore', 'crystalBleuScore', 'codeBleuScore']
    
admin.site.register(Review, ReviewAdmin)