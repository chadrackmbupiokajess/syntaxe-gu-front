from django.db import models
from django.conf import settings

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('new_assignment', 'Nouveau TP/TD ou Quiz'),
        ('results_available', 'Résultats disponibles'),
        ('payment_validated', 'Paiement validé'),
        ('academic_warning', 'Avertissement académique'),
    )

    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.target_user.matricule}: {self.message[:50]}..."


class ActivityLog(models.Model):
    ACTION_TYPES = (
        ('user_login', 'Connexion utilisateur'),
        ('submission', 'Soumission de devoir'),
        ('payment', 'Paiement effectué'),
        ('create', "Création d'objet"),
        ('update', "Mise à jour d'objet"),
        ('delete', "Suppression d'objet"),
    )

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    details = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.actor:
            return f"{self.actor.matricule} performed action: {self.get_action_type_display()}"
        return f"System action: {self.get_action_type_display()}"
