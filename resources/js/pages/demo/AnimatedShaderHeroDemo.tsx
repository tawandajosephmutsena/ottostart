import React from 'react';
import AnimatedShaderHero from '@/components/ui/animated-shader-hero';

export default function AnimatedShaderHeroDemo() {
  const handlePrimaryClick = () => {
    console.log('Get Started clicked!');
    alert('Get Started clicked!');
  };

  const handleSecondaryClick = () => {
    console.log('Explore Features clicked!');
    alert('Explore Features clicked!');
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-zinc-950">
      <AnimatedShaderHero
        trustBadge={{
          text: "Trusted by forward-thinking teams.",
          icons: ["✨", "🚀", "⭐️"]
        }}
        headline={{
          line1: "Launch Your",
          line2: "Workflow Into Orbit"
        }}
        subtitle="Supercharge productivity with AI-powered automation and integrations built for the next generation of teams — fast, seamless, and limitless."
        buttons={{
          primary: {
            text: "Get Started for Free",
            onClick: handlePrimaryClick
          },
          secondary: {
            text: "Explore Features",
            onClick: handleSecondaryClick
          }
        }}
      />
      
      {/* Documentation Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
              How to Use
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
              The <code className="text-orange-600 dark:text-orange-400 font-mono">AnimatedShaderHero</code> component creates a stunning first impression with a WebGL-powered background that reacts to mouse movement.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-zinc-100/50 dark:bg-zinc-900">
              <span className="text-sm font-medium text-zinc-500">Usage Example</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
{`import AnimatedShaderHero from "@/components/ui/animated-shader-hero";

<AnimatedShaderHero
  trustBadge={{
    text: "Trusted by forward-thinking teams.",
    icons: ["✨", "🚀"]
  }}
  headline={{
    line1: "Launch Your",
    line2: "Workflow Into Orbit"
  }}
  subtitle="Supercharge productivity with AI-powered automation."
  buttons={{
    primary: {
      text: "Get Started",
      onClick: () => console.log("Primary clicked")
    },
    secondary: {
      text: "Learn More",
      onClick: () => console.log("Secondary clicked")
    }
  }}
/>`}
              </pre>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-semibold mb-2">Performance Optimized</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Uses WebGL2 for smooth 60fps animations that are performant across devices. Automatically handles resize events and pointer tracking.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-semibold mb-2">Fully Customizable</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Easily configure the headline, subtitle, buttons, and trust badge through props. The background shader handles the visual magic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
