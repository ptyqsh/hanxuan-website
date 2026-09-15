/* =====================================================
   厦门韩轩一品装饰设计工程有限公司 · 主交互脚本
   ===================================================== */

(function () {
    'use strict';

    /* =====================================================
       表单提交配置 · 腾讯文档收集表接收地址
       =====================================================
       后续运维步骤：
       1. 打开腾讯文档收集表（您已创建的那一份）
       2. 获取 POST 提交端点（参考运维手册第 X 节）
       3. 把下方 TENCENT_DOCS_FORM_URL 的值替换为真实 URL
       4. 保持占位符 'PENDING_TENCENT_DOCS_URL' 时，
          表单仍能正常反馈"已收到"，但数据不会真正发送
       ===================================================== */
    const TENCENT_DOCS_FORM_URL = 'PENDING_TENCENT_DOCS_URL';
    const FORM_PLACEHOLDER = 'PENDING_TENCENT_DOCS_URL';

    /* ---------- 导航栏滚动效果 ---------- */
    const nav = document.querySelector('.nav');
    if (nav) {
        const handleScroll = () => {
            if (window.scrollY > 16) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    /* ---------- 移动端菜单切换 ---------- */
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // 点击菜单项后自动关闭
        navMenu.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    /* ---------- 滚动入场动画 ---------- */
    const fadeEls = document.querySelectorAll('.fade-up');
    if ('IntersectionObserver' in window && fadeEls.length) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        );
        fadeEls.forEach((el) => io.observe(el));
    } else {
        fadeEls.forEach((el) => el.classList.add('in-view'));
    }

    /* ---------- 案例筛选（仅 cases.html） ---------- */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const caseCards = document.querySelectorAll('.case-card');
    if (filterButtons.length && caseCards.length) {
        filterButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                filterButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                caseCards.forEach((card) => {
                    const cat = card.dataset.category || '';
                    if (filter === 'all' || cat === filter) {
                        card.style.display = '';
                        setTimeout(() => card.classList.add('in-view'), 30);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /* ---------- 表单提交 ---------- */
    const forms = document.querySelectorAll('form[data-form]');
    forms.forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('[type="submit"]');
            if (!submitBtn) return;
            const original = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '正在提交…';

            let success = true;
            const targetUrl = TENCENT_DOCS_FORM_URL;

            // 仅当用户后续填入了真实 URL 时才真正发送请求
            if (targetUrl && targetUrl !== FORM_PLACEHOLDER) {
                try {
                    const formData = new FormData(form);
                    await fetch(targetUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: formData
                    });
                } catch (err) {
                    console.error('[表单] 提交到腾讯文档失败：', err);
                    success = false;
                }
            } else {
                // 占位符未替换：仅做 UI 模拟反馈，数据不会真正发送
                await new Promise((resolve) => setTimeout(resolve, 600));
            }

            if (success) {
                submitBtn.textContent = '✓ 已收到，我们会尽快与您联系';
                form.reset();
            } else {
                submitBtn.textContent = '⚠ 提交失败，请稍后重试或拨打客服电话';
            }
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = original;
            }, 3000);
        });
    });

    /* ---------- 平滑滚动锚点 ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        link.addEventListener('click', (e) => {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ---------- 当前页高亮 ---------- */
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach((link) => {
        const href = link.getAttribute('href');
        if (href === path || (path === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    /* ---------- 数字滚动动画（Hero 统计） ---------- */
    const statNums = document.querySelectorAll('[data-count]');
    if ('IntersectionObserver' in window && statNums.length) {
        const counterIo = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseInt(el.dataset.count, 10);
                        const suffix = el.dataset.suffix || '';
                        const duration = 1500;
                        const start = performance.now();
                        const animate = (now) => {
                            const t = Math.min(1, (now - start) / duration);
                            const eased = 1 - Math.pow(1 - t, 3);
                            el.textContent = Math.floor(target * eased) + suffix;
                            if (t < 1) requestAnimationFrame(animate);
                            else el.textContent = target + suffix;
                        };
                        requestAnimationFrame(animate);
                        counterIo.unobserve(el);
                    }
                });
            },
            { threshold: 0.4 }
        );
        statNums.forEach((el) => counterIo.observe(el));
    }
})();
