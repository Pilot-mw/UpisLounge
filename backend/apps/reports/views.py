from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    from apps.sales.models import Sale
    from apps.inventory.models import Inventory
    from apps.employees.models import Employee
    from apps.branches.models import Branch

    branch_id = request.query_params.get('branch')

    sales_qs = Sale.objects.all()
    inv_qs = Inventory.objects.all()
    emp_qs = Employee.objects.filter(is_active=True)

    if branch_id:
        sales_qs = sales_qs.filter(branch_id=branch_id)
        inv_qs = inv_qs.filter(branch_id=branch_id)
        emp_qs = emp_qs.filter(branch_id=branch_id)

    today = timezone.now().date()
    sales_today = sales_qs.filter(created_at__date=today).aggregate(
        total=Sum('total_amount'),
        count=Count('id')
    )

    total_stock_value = inv_qs.aggregate(
        total=Sum('remaining_stock') * 0
    )
    from django.db.models import F, ExpressionWrapper, DecimalField, Value
    from decimal import Decimal
    stock_val = inv_qs.annotate(
        stock_val=ExpressionWrapper(
            F('remaining_stock') * F('selling_price'),
            output_field=DecimalField()
        )
    ).aggregate(total=Sum('stock_val'))['total'] or 0

    low_stock = inv_qs.filter(remaining_stock__lte=F('reorder_level')).count()
    active_staff = emp_qs.filter(attendance_status='Present').count()
    total_staff = emp_qs.count()

    sales_by_branch = Branch.objects.annotate(
        total_sales=Sum('sales__total_amount', filter=Q(sales__created_at__date=today))
    ).values('id', 'name', 'total_sales')

    revenue_trend = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_sales = Sale.objects.filter(created_at__date=day)
        if branch_id:
            day_sales = day_sales.filter(branch_id=branch_id)
        total = day_sales.aggregate(s=Sum('total_amount'))['s'] or 0
        revenue_trend.append({
            'day': day.strftime('%a'),
            'revenue': float(total)
        })

    from apps.sales.models import SaleItem
    top_selling = SaleItem.objects.values('product_name').annotate(
        total_qty=Sum('quantity'),
        total_revenue=Sum('total_price')
    ).order_by('-total_qty')[:6]

    return Response({
        'sales_today': float(sales_today['total'] or 0),
        'transactions_today': sales_today['count'] or 0,
        'total_stock_value': float(stock_val),
        'low_stock_count': low_stock,
        'active_staff': active_staff,
        'total_staff': total_staff,
        'stock_value': float(stock_val),
        'sales_by_branch': list(sales_by_branch),
        'revenue_trend': revenue_trend,
        'top_selling': list(top_selling),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_data(request):
    from apps.sales.models import Sale
    from apps.sales.models import SaleItem
    from apps.branches.models import Branch

    branch_id = request.query_params.get('branch')
    period = request.query_params.get('period', 'daily')  # daily, weekly, monthly

    sales_qs = Sale.objects.all()
    if branch_id:
        sales_qs = sales_qs.filter(branch_id=branch_id)

    today = timezone.now().date()

    if period == 'daily':
        start_date = today
    elif period == 'weekly':
        start_date = today - timedelta(days=7)
    else:
        start_date = today - timedelta(days=30)

    sales_qs = sales_qs.filter(created_at__date__gte=start_date)

    total_revenue = sales_qs.aggregate(s=Sum('total_amount'))['s'] or 0
    total_transactions = sales_qs.count()
    avg_ticket = float(total_revenue / total_transactions) if total_transactions > 0 else 0

    branch_perf = Branch.objects.annotate(
        sales_total=Sum('sales__total_amount', filter=Q(sales__created_at__date__gte=start_date)),
        sales_count=Count('sales', filter=Q(sales__created_at__date__gte=start_date))
    ).values('id', 'name', 'sales_total', 'sales_count')

    return Response({
        'period': period,
        'total_revenue': float(total_revenue),
        'total_transactions': total_transactions,
        'avg_ticket': avg_ticket,
        'branch_performance': list(branch_perf),
    })
