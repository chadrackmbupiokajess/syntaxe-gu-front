from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms # Import forms

User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    # Définir explicitement les champs de mot de passe pour la validation
    password = forms.CharField(label="Mot de passe", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirmation du mot de passe", widget=forms.PasswordInput)

    class Meta:
        model = User
        # Inclure les champs de base, mais pas les mots de passe ici car ils sont définis ci-dessus
        fields = ("matricule", "email", "first_name", "last_name", "role")

    def clean_password2(self):
        password = self.cleaned_data.get("password")
        password2 = self.cleaned_data.get("password2")
        if password and password2 and password != password2:
            raise forms.ValidationError("Les deux mots de passe ne correspondent pas.")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = (
            "matricule", "email", "first_name", "last_name", "post_name",
            "role", "is_active", "is_staff", "is_superuser", "groups",
            "user_permissions", "current_auditoire", "academic_status",
            "sexe", "phone", "office", "address", "profile_picture"
        )
