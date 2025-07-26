def combine_lists(list1, list2):
    combined = sorted(list1 + list2, key=lambda x: x["positions"][0])
    result = []

    for item in combined:
        if not result:
            result.append(item)
            continue

        prev = result[-1]
        l1, r1 = prev["positions"]
        l2, r2 = item["positions"]

        overlap = max(0, min(r1, r2) - max(l1, l2))
        len2 = r2 - l2

        if overlap > len2 / 2:
            # Combine values and update right position only if needed
            prev["values"].extend(item["values"])
            prev["positions"][1] = max(r1, r2)
        else:
            result.append(item)
    return result

# Example
list1 = [{"positions": [0, 5], "values": [1, 2, 3]}]
list2 = [{"positions": [3, 7], "values": [4, 5]}]
print(combine_lists(list1, list2))
