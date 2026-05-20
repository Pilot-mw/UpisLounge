from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Cashier', 'Cashier'),
        ('Bartender', 'Bartender'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Cashier')
    phone = models.CharField(max_length=20, blank=True)
    branch = models.ForeignKey('branches.Branch', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.role})'
