def format_indian_currency(amount):
    amount_str = f"{amount:.10f}".rstrip("0").rstrip(".")
    if "." in amount_str:
        integer_part, fractional_part = amount_str.split(".")
    else:
        integer_part, fractional_part = amount_str, ""

    n = len(integer_part)
    if n <= 3:
        formatted = integer_part
    else:
        # Last 3 digits
        last_three = integer_part[-3:]
        remaining = integer_part[:-3]
        # Add commas every 2 digits
        parts = []
        while len(remaining) > 2:
            parts.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            parts.insert(0, remaining)
        formatted = ",".join(parts) + "," + last_three

    return formatted + ('.' + fractional_part if fractional_part else '')

# Example
print(format_indian_currency(123456.7891))  # Output: 1,23,456.7891
