# Station 4 (Lembah Air Terjun) artwork preparation
#
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File tools\process-valley-assets.ps1
#
# Sprites (droplet / big drop / Wally): transparent border is removed, the art is
# scaled proportionally and placed on a fixed canvas, so the in-game size never
# jumps between drawings. Backdrop: cropped to 16:9 (cover) and scaled to 1920x1080.
#
# Add or change inputs in the $jobs table below.

Add-Type -AssemblyName System.Drawing

# The alpha cut-off 128 keeps solid artwork and ignores faint glow / watermark haze.
$code = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class ValleyArt
{
    public static void Build(string srcPath, string dstPath, int canvasW, int canvasH, string gravity, bool cover)
    {
        using (var src = new Bitmap(srcPath))
        {
            int w = src.Width, h = src.Height;
            int minX = 0, minY = 0, cw = w, ch = h;

            if (!cover)
            {
                var rect = new Rectangle(0, 0, w, h);
                var data = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                int stride = data.Stride;
                byte[] buf = new byte[stride * h];
                Marshal.Copy(data.Scan0, buf, 0, buf.Length);
                src.UnlockBits(data);

                int maxX = -1, maxY = -1;
                minX = w; minY = h;
                for (int y = 0; y < h; y++)
                {
                    int row = y * stride;
                    for (int x = 0; x < w; x++)
                    {
                        if (buf[row + x * 4 + 3] > 128)
                        {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                if (maxX < 0) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
                cw = maxX - minX + 1;
                ch = maxY - minY + 1;
            }

            double scale = cover
                ? Math.Max((double)canvasW / cw, (double)canvasH / ch)
                : Math.Min((double)canvasW / cw, (double)canvasH / ch) * 0.98;

            int tw = Math.Max(1, (int)Math.Round(cw * scale));
            int th = Math.Max(1, (int)Math.Round(ch * scale));
            int ox = (canvasW - tw) / 2;
            int oy = gravity == "bottom" ? canvasH - th : (canvasH - th) / 2;

            using (var canvas = new Bitmap(canvasW, canvasH, PixelFormat.Format32bppArgb))
            {
                using (var g = Graphics.FromImage(canvas))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.Clear(Color.Transparent);
                    g.DrawImage(src, new Rectangle(ox, oy, tw, th), new Rectangle(minX, minY, cw, ch), GraphicsUnit.Pixel);
                }

                var dir = System.IO.Path.GetDirectoryName(dstPath);
                if (!System.IO.Directory.Exists(dir)) System.IO.Directory.CreateDirectory(dir);
                canvas.Save(dstPath, ImageFormat.Png);
            }
        }
    }
}
'@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$root    = Split-Path -Parent $PSScriptRoot
$artRoot = Join-Path $root 'design-assets'
$outRoot = Join-Path $root 'public\assets\images\waterfall-valley'

$jobs = @(
    @{ Source = (Join-Path $artRoot 'illustrations\valley-bg.png'); Dest = 'valley-bg.png'; W = 1920; H = 1080; Gravity = 'center'; Cover = $true  },
    @{ Source = (Join-Path $artRoot 'illustrations\droplet.png');   Dest = 'droplet.png';   W = 256;  H = 256;  Gravity = 'center'; Cover = $false },
    @{ Source = (Join-Path $artRoot 'illustrations\big-drop.png');  Dest = 'big-drop.png';  W = 512;  H = 640;  Gravity = 'bottom'; Cover = $false },
    @{ Source = (Join-Path $artRoot 'characters\wally-valley.png'); Dest = 'wally.png';     W = 480;  H = 480;  Gravity = 'bottom'; Cover = $false }
)

$done = 0
foreach ($job in $jobs) {
    if (-not (Test-Path $job.Source)) {
        Write-Host ("skip (missing): " + $job.Source)
        continue
    }
    $dest = Join-Path $outRoot $job.Dest
    [ValleyArt]::Build($job.Source, $dest, $job.W, $job.H, $job.Gravity, $job.Cover)
    $info = Get-Item $dest
    Write-Host ("ok: " + $job.Dest + " -> " + $info.Length + " bytes")
    $done++
}

Write-Host ("finished. " + $done + " file(s) written to " + $outRoot)
if ($done -eq 0) { Write-Host 'Nothing written: put the source files in design-assets first.' }