'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

// Tunnel 效果组件 - 使用 Three.js 实现炫酷隧道效果
export default function TunnelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 动态导入 Three.js 组件
    const loadTunnel = async () => {
      try {
        // 使用 CDN 加载 threejs-components
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import TunnelComponent from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.30/build/backgrounds/tunnel1.min.js';

          const canvas = document.getElementById('tunnel-canvas');
          if (canvas && !window.tunnelApp) {
            const app = TunnelComponent(canvas, {});
            window.tunnelApp = app;

            // 设置初始颜色 - 绿色系配色
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
              // 深色主题：绿色系配色（参考用户图片）
              app.tunnel.setColors(['#4adeb9', '#22c55e', '#169aa3', '#218015', '#043525']);
            } else {
              // 浅色主题：蓝色系配色
              app.tunnel.setColors(['#2563eb', '#4d99f2', '#7f59e6', '#3380d9', '#1a4dcc']);
            }

            app.tunnel.uniforms.uNoiseScaleX.value = 2.0;
            app.tunnel.uniforms.uNoiseTresholds.value[0] = 1 - 0.496041406596456;
            app.tunnel.uniforms.uNoiseTresholds.value[1] = 1 - 0.17835484130314838;
            app.tunnel.uniforms.uNoiseTresholds.value[2] = 1 - 0.40281655839303965;
            app.tunnel.uniforms.uNoiseTresholds.value[3] = 1 - 0.4460903073277931;
            app.tunnel.uniforms.uNoiseTresholds.value[4] = 1 - 0.47434758220851125;
          }
        `;
        document.head.appendChild(script);
      } catch (error) {
        console.warn('Failed to load tunnel effect:', error);
      }
    };

    loadTunnel();

    // 监听主题变化
    const handleThemeChange = () => {
      const app = (window as any).tunnelApp;
      if (app) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          // 绿色系配色
          app.tunnel.setColors(['#4ade80', '#22c55e', '#16a34a', '#15803d', '#10b981']);
        } else {
          app.tunnel.setColors(['#2563eb', '#4d99f2', '#7f59e6', '#3380d9', '#1a4dcc']);
        }
      }
    };

    // 监听主题变化
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      observer.disconnect();
      // 清理脚本
      const scripts = document.querySelectorAll('script[type="module"]');
      scripts.forEach(s => {
        if (s.textContent?.includes('threejs-components')) {
          s.remove();
        }
      });
    };
  }, []);

  // 当主题变化时更新颜色
  useEffect(() => {
    const app = (window as any).tunnelApp;
    if (app) {
      if (isDark) {
        // 绿色系配色：亮绿、草绿、深绿、森林绿、祖母绿
        app.tunnel.setColors(['#4ade80', '#22c55e', '#16a34a', '#15803d', '#10b981']);
      } else {
        app.tunnel.setColors(['#2563eb', '#4d99f2', '#7f59e6', '#3380d9', '#1a4dcc']);
      }
    }
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <canvas
        id="tunnel-canvas"
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
