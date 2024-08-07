from django.contrib import admin
from fileAnalyzer.models import Review

# Register your models here.
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'date', 'review' , 'reviewModes']
    
admin.site.register(Review, ReviewAdmin)