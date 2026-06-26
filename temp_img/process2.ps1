Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\Sayantan\.antigravity\AmpEdge\admin-dashboard\public\logo.png"

if (!(Test-Path $imgPath)) {
    Write-Output "Image not found at $imgPath"
    exit
}

$img = [System.Drawing.Bitmap]::FromFile($imgPath)

# Create a fresh 32bpp ARGB bitmap for proper transparency handling
$newImg = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($newImg)
$graphics.DrawImage($img, 0, 0)
$graphics.Dispose()
$img.Dispose()

# Make near-white pixels completely transparent
$minX = $newImg.Width; $minY = $newImg.Height; $maxX = 0; $maxY = 0

for ($y = 0; $y -lt $newImg.Height; $y++) {
    for ($x = 0; $x -lt $newImg.Width; $x++) {
        $pixel = $newImg.GetPixel($x, $y)
        
        # If the pixel is very light/white (R>220, G>220, B>220), make it transparent
        if ($pixel.R -gt 220 -and $pixel.G -gt 220 -and $pixel.B -gt 220) {
            $newImg.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
            # Update bounds for cropping based ONLY on non-transparent (actual logo) pixels
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# If the image was entirely white, prevent crash
if ($minX -gt $maxX) {
    Write-Output "Image was completely transparent/white."
    $newImg.Dispose()
    exit
}

# Crop the image to exactly fit the logo
$rect = New-Object System.Drawing.Rectangle($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
$croppedImg = $newImg.Clone($rect, $newImg.PixelFormat)
$newImg.Dispose()

# Save final result
$croppedImg.Save($imgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedImg.Dispose()

Write-Output "Done"
