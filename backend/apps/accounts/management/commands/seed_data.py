from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.branches.models import Branch
from apps.products.models import Category, Product
from apps.inventory.models import Inventory
from apps.employees.models import Employee

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with initial UPIS data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create branches
        zomba, _ = Branch.objects.get_or_create(
            name='UPIS Zomba',
            defaults={
                'location': 'Zomba, Malawi',
                'phone': '+265 888 123 456',
                'email': 'zomba@upislounge.com',
                'manager_name': 'Chifundo Banda',
            }
        )
        mangochi, _ = Branch.objects.get_or_create(
            name='UPIS Mangochi',
            defaults={
                'location': 'Mangochi, Malawi',
                'phone': '+265 888 678 901',
                'email': 'mangochi@upislounge.com',
                'manager_name': 'Grace Banda',
            }
        )
        self.stdout.write('[OK] Branches created')

        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@upislounge.com',
                password='admin123',
                role='Admin',
            )
        self.stdout.write('[OK] Admin user created (admin@upislounge.com / admin123)')

        # Create categories
        beer_cat, _ = Category.objects.get_or_create(name='Beer')
        spirit_cat, _ = Category.objects.get_or_create(name='Spirit')
        self.stdout.write('[OK] Categories created')

        # Create products
        beer_products = [
            ('Carlsberg Green', 2000),
            ('Carlsberg Special Brew', 2500),
            ('Carlsberg Chill', 1800),
            ('Kuche Kuche', 1500),
            ('Doppel Munich', 2800),
            ('Castel Beer', 2200),
            ('Sapitwa', 1600),
            ('Pomme Breeze', 2000),
        ]
        spirit_products = [
            ('Malawi Gin', 6000),
            ('Malawi Vodka', 5500),
            ('Premier Brandy', 8000),
        ]

        all_products = []
        for name, price in beer_products:
            p, _ = Product.objects.get_or_create(name=name, defaults={
                'category': beer_cat,
                'selling_price': price,
            })
            all_products.append(p)

        for name, price in spirit_products:
            p, _ = Product.objects.get_or_create(name=name, defaults={
                'category': spirit_cat,
                'selling_price': price,
            })
            all_products.append(p)
        self.stdout.write(f'[OK] {len(all_products)} products created')

        # Create inventory
        zomba_open = [45, 30, 50, 40, 25, 35, 28, 20, 18, 15, 12]
        mangochi_open = [30, 25, 35, 28, 20, 30, 15, 12, 12, 10, 8]
        zomba_add = [20, 15, 25, 18, 10, 20, 15, 12, 8, 6, 5]
        mangochi_add = [15, 10, 18, 12, 8, 15, 5, 4, 6, 3, 4]

        for i, product in enumerate(all_products):
            Inventory.objects.get_or_create(
                product=product,
                branch=zomba,
                defaults={
                    'open_stock': zomba_open[i],
                    'added_stock': zomba_add[i],
                    'sold_stock': 0,
                    'selling_price': product.selling_price,
                    'reorder_level': 5,
                }
            )
            Inventory.objects.get_or_create(
                product=product,
                branch=mangochi,
                defaults={
                    'open_stock': mangochi_open[i],
                    'added_stock': mangochi_add[i],
                    'sold_stock': 0,
                    'selling_price': product.selling_price,
                    'reorder_level': 5,
                }
            )
        self.stdout.write('[OK] Inventory created for both branches')

        # Create employees
        employees_data = [
            ('Chifundo Banda', 'Manager', zomba, 'Present', '08:00 - 17:00', '+265 888 123 456'),
            ('Temwa Nkhoma', 'Cashier', zomba, 'Present', '08:00 - 17:00', '+265 888 234 567'),
            ('Kondwani Phiri', 'Waiter', zomba, 'Present', '14:00 - 23:00', '+265 888 345 678'),
            ('Thandiwe Mwale', 'Waiter', zomba, 'Absent', '14:00 - 23:00', '+265 888 456 789'),
            ('Brighton Kachali', 'Cashier', zomba, 'Present', '08:00 - 17:00', '+265 888 567 890'),
            ('Grace Banda', 'Manager', mangochi, 'Present', '08:00 - 17:00', '+265 888 678 901'),
            ('Lusayo Gondwe', 'Waiter', mangochi, 'Present', '14:00 - 23:00', '+265 888 789 012'),
            ('Zikomo Nyirenda', 'Cashier', mangochi, 'Late', '08:00 - 17:00', '+265 888 890 123'),
            ('Chikondi Kamanga', 'Waiter', mangochi, 'Present', '14:00 - 23:00', '+265 888 901 234'),
        ]
        for name, role, branch, att, shift, phone in employees_data:
            Employee.objects.get_or_create(
                full_name=name,
                defaults={
                    'role': role,
                    'branch': branch,
                    'attendance_status': att,
                    'shift_time': shift,
                    'phone': phone,
                }
            )
        self.stdout.write('[OK] Employees created')

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
        self.stdout.write('Login: admin@upislounge.com / admin123')
