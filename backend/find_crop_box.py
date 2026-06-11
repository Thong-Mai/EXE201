from PIL import Image

def get_white_box(img_path):
    img = Image.open(img_path)
    img_rgb = img.convert('RGB')
    w, h = img.size
    
    # Scan vertically down the middle of the image
    mid_x = w // 2
    white_starts = None
    white_ends = None
    
    for y in range(h):
        r, g, b = img_rgb.getpixel((mid_x, y))
        is_white = r > 245 and g > 245 and b > 245
        if is_white and white_starts is None:
            white_starts = y
        if not is_white and white_starts is not None and white_ends is None:
            # Check if there are white pixels further down to avoid stopping inside the QR code
            has_more_white = False
            for ny in range(y, min(y + 40, h)):
                nr, ng, nb = img_rgb.getpixel((mid_x, ny))
                if nr > 245 and ng > 245 and nb > 245:
                    has_more_white = True
                    break
            if not has_more_white:
                white_ends = y
                break
                
    if white_starts is None:
        white_starts = int(h * 0.2)
    if white_ends is None:
        white_ends = int(h * 0.8)
        
    # Scan horizontally at the middle y of the card
    mid_y = (white_starts + white_ends) // 2
    left_x = None
    right_x = None
    for x in range(w):
        r, g, b = img_rgb.getpixel((x, mid_y))
        is_white = r > 245 and g > 245 and b > 245
        if is_white and left_x is None:
            left_x = x
        if not is_white and left_x is not None and right_x is None:
            has_more_white = False
            for nx in range(x, min(x + 20, w)):
                nr, ng, nb = img_rgb.getpixel((nx, mid_y))
                if nr > 245 and ng > 245 and nb > 245:
                    has_more_white = True
                    break
            if not has_more_white:
                right_x = x
                break
                
    if left_x is None:
        left_x = int(w * 0.1)
    if right_x is None:
        right_x = int(w * 0.9)
        
    return left_x, white_starts, right_x, white_ends

print("Img1 crop box:", get_white_box('C:/Users/ADMIN/.gemini/antigravity-ide/brain/585e4e70-ea53-42ac-8edd-a86511218f31/media__1781089322814.png'))
print("Img2 crop box:", get_white_box('C:/Users/ADMIN/.gemini/antigravity-ide/brain/585e4e70-ea53-42ac-8edd-a86511218f31/media__1781090382605.png'))
