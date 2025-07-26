def caesar_cipher(text, shift, decode=False):
    if decode:
        shift = -shift
    result = ""
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            shifted = (ord(char) - base + shift) % 26 + base
            result += chr(shifted)
        else:
            result += char  # Non-alphabetic characters are unchanged
    return result

# Example
encoded = caesar_cipher("Hello, World!", 3)
decoded = caesar_cipher(encoded, 3, decode=True)
print("Encoded:", encoded)
print("Decoded:", decoded)
