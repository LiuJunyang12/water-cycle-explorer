# Cloud Kingdom 素材处理脚本
#
# 用途：把 design-assets/characters 里的原图（任意尺寸、带大片透明边）处理成
#       游戏用的固定画布 PNG —— 自动裁掉透明边、等比缩放、底部居中，
#       这样 Wally 三张立绘不会因为画布大小不同而在切换时"变大变小"。
#
# 用法（在项目根目录）：
#   powershell -ExecutionPolicy Bypass -File tools\process-sprites.ps1
#
# 加新素材时：改下面的 $jobs 表（文件名 + 画布尺寸），再运行一次。

Add-Type -AssemblyName System.Drawing

$code = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class SpriteCanvas
{
    public static string Build(string srcPath, string dstPath, int canvasW, int canvasH)
    {
        using (var src = new Bitmap(srcPath))
        {
            int w = src.Width, h = src.Height;
            var rect = new Rectangle(0, 0, w, h);
            var data = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            byte[] buf = new byte[stride * h];
            Marshal.Copy(data.Scan0, buf, 0, buf.Length);
            src.UnlockBits(data);

            int minX = w, minY = h, maxX = -1, maxY = -1;
            for (int y = 0; y < h; y++)
            {
                int row = y * stride;
                for (int x = 0; x < w; x++)
                {
                    if (buf[row + x * 4 + 3] > 8)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX < 0) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
            int cw = maxX - minX + 1, ch = maxY - minY + 1;

            double scale = Math.Min((double)canvasW / cw, (double)canvasH / ch) * 0.98;
            int tw = Math.Max(1, (int)Math.Round(cw * scale));
            int th = Math.Max(1, (int)Math.Round(ch * scale));
            int ox = (canvasW - tw) / 2;
            int oy = canvasH - th;

            using (var canvas = new Bitmap(canvasW, canvasH, PixelFormat.Format32bppArgb))
            {
                using (var g = Graphics.FromImage(canvas))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingMode = CompositingMode.SourceCopy;
                    using (var ia = new ImageAttributes())
                    {
                        ia.SetWrapMode(WrapMode.TileFlipXY);
                        g.DrawImage(src, new Rectangle(ox, oy, tw, th), minX, minY, cw, ch, GraphicsUnit.Pixel, ia);
                    }
                }
                canvas.Save(dstPath, ImageFormat.Png);
                return string.Format("{0}x{1} (art {2}x{3})", canvasW, canvasH, tw, th);
            }
        }
    }
}
'@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root 'design-assets\characters'
$outDir = Join-Path $root 'public\assets\images\cloud-kingdom'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

# 文件名 -> 目标画布（Wally 三态与门统一 3:4，障碍用 4:5）
$jobs = @(
  @{ n = 'wally-stand.png'; w = 480; h = 640 },
  @{ n = 'wally-walk.png';  w = 480; h = 640 },
  @{ n = 'wally-jump.png';  w = 480; h = 640 },
  @{ n = 'hazard-air.png';  w = 256; h = 320 },
  @{ n = 'door-masuk.png';  w = 480; h = 640 },
  @{ n = 'door-keluar.png'; w = 480; h = 640 }
)

foreach ($job in $jobs) {
  $src = Join-Path $srcDir $job.n
  if (-not (Test-Path $src)) { Write-Host "跳过 $($job.n)：原图不存在"; continue }
  $dst = Join-Path $outDir $job.n
  $info = [SpriteCanvas]::Build($src, $dst, $job.w, $job.h)
  $kb = [math]::Round((Get-Item $dst).Length / 1KB)
  Write-Host ("{0,-18} {1,-24} {2,5} KB" -f $job.n, $info, $kb)
}
