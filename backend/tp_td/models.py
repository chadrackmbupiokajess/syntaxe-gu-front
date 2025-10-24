from django.db import models

class TPTD(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "TP/TD"
        verbose_name_plural = "TP/TDs"
        ordering = ['due_date']

    def __str__(self):
        return self.title
