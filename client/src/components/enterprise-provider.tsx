import React, { useEffect } from "react";
import { DesignSystem } from "@/lib/enterprise-design";

export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // Inject CSS Variables for Physics, Colors, and Typography
        const styleId = "enterprise-design-system-vars";
        let style = document.getElementById(styleId);

        if (!style) {
            style = document.createElement("style");
            style.id = styleId;
            document.head.appendChild(style);
        }

        // Generate the CSS from our Design System Engine
        let css = ":root {\n";

        // 1. Colors - Brand
        Object.entries(DesignSystem.colors.brand).forEach(([key, val]) => {
            // @ts-ignore
            css += `  --color-brand-${key}: ${val.h} ${val.s}% ${val.l}%;\n`;
        });

        // 2. Colors - Neutral
        Object.entries(DesignSystem.colors.neutral).forEach(([key, val]) => {
            // @ts-ignore
            css += `  --color-neutral-${key}: ${val.h} ${val.s}% ${val.l}%;\n`;
        });

        // 3. Physics
        css += `  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);\n`;
        css += `  --ease-glitch: steps(2, jump-none);\n`;

        css += "}\n";

        // Global Styles for Glassmorphism & Scrollbars
        css += `
      body {
        background-color: hsl(240 20% 1%); /* Neutral 0 */
        color: white;
        font-family: ${DesignSystem.type.fontFamily.sans};
        -webkit-font-smoothing: antialiased;
      }
      
      /* Enterprise Scrollbar */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: hsl(240 10% 10%);
      }
      ::-webkit-scrollbar-thumb {
        background: hsl(240 5% 40%);
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: hsl(265 98% 60%); /* Brand Primary */
      }

      /* Text Selection */
      ::selection {
        background: hsl(265 98% 60% / 0.3);
        color: white;
      }
    `;

        style.innerHTML = css;

    }, []);

    return <>{children}</>;
};
