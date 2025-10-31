from flask import request
from math import ceil


def get_pagination_params(default_page=1, default_limit=10, max_limit=100):
    """
    Extract pagination parameters from request query string.
    
    Args:
        default_page: Default page number if not provided (default: 1)
        default_limit: Default items per page if not provided (default: 10)
        max_limit: Maximum allowed items per page (default: 100)
    
    Returns:
        tuple: (page, limit) - Both are integers
    """
    try:
        page = int(request.args.get('page', default_page))
        limit = int(request.args.get('limit', default_limit))
        
        # Ensure minimum values
        page = max(1, page)
        limit = max(1, min(limit, max_limit))
        
        return page, limit
    except (ValueError, TypeError):
        return default_page, default_limit


def paginate_query(query, page, limit):
    """
    Paginate a SQLAlchemy query.
    
    Args:
        query: SQLAlchemy query object
        page: Current page number (1-indexed)
        limit: Number of items per page
    
    Returns:
        tuple: (paginated_items, total_count, total_pages)
    """
    # Get total count
    total_count = query.count()
    
    # Calculate total pages
    total_pages = ceil(total_count / limit) if limit > 0 else 0
    
    # Apply pagination
    offset = (page - 1) * limit
    paginated_items = query.offset(offset).limit(limit).all()
    
    return paginated_items, total_count, total_pages


def create_pagination_response(items, page, limit, total_count, total_pages, resource_name):
    """
    Create a standardized pagination response.
    
    Args:
        items: List of items for the current page
        page: Current page number
        limit: Items per page
        total_count: Total number of items
        total_pages: Total number of pages
        resource_name: Name of the resource (e.g., 'payslips', 'employees')
    
    Returns:
        dict: Response dictionary with message, resource data, and pagination info
    """
    return {
        'message': f'{resource_name.capitalize()} fetched successfully',
        resource_name: [item.to_dict() if hasattr(item, 'to_dict') else item for item in items],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total_count,
            'pages': total_pages,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }
    }

