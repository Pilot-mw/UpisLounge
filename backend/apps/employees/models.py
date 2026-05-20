from django.db import models
from apps.branches.models import Branch

class Employee(models.Model):
    ROLE_CHOICES = [
        ('Manager', 'Manager'),
        ('Cashier', 'Cashier'),
        ('Bartender', 'Bartender'),
        ('Waiter', 'Waiter'),
    ]
    ATTENDANCE_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
    ]
    full_name = models.CharField(max_length=200)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Waiter')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='employees')
    phone = models.CharField(max_length=20, blank=True)
    shift_time = models.CharField(max_length=50, default='08:00 - 17:00')
    attendance_status = models.CharField(max_length=20, choices=ATTENDANCE_CHOICES, default='Present')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return f'{self.full_name} ({self.role})'
