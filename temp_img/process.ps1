Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\Sayantan\.antigravity\AmpEdge\admin-dashboard\public\logo.png"
$img = [System.Drawing.Bitmap]::FromFile($imgPath)

# Create a copy so we can dispose the original and overwrite it
$newImg = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
$graphics = [System.Drawing.Graphics]::FromImage($newImg)
$graphics.DrawImage($img, 0, 0)
$graphics.Dispose()
$img.Dispose()

# Find the bounding box of non-white pixels to crop
$minX = $newImg.Width; $minY = $newImg.Height; $maxX = 0; $maxY = 0

for ($y = 0; $y -lt $newImg.Height; $y++) {
    for ($x = 0; $x -lt $newImg.Width; $x++) {
        $pixel = $newImg.GetPixel($x, $y)
        if ($pixel.R -lt 240 -or $pixel.G -lt 240 -or $pixel.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Crop the image
$rect = New-Object System.Drawing.Rectangle($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
$croppedImg = $newImg.Clone($rect, $newImg.PixelFormat)
$newImg.Dispose()

# Make white transparent in the cropped image
$croppedImg.MakeTransparent([System.Drawing.Color]::White)
$croppedImg.Save($imgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedImg.Dispose()
