#!/usr/bin/env node

/**
 * Universal Deployment CLI
 * Supports deployment to multiple platforms
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const platforms = {
  vercel: {
    name: 'Vercel',
    detect: () => fs.existsSync('vercel.json') || fs.existsSync('deploy/vercel.json'),
    deploy: async () => {
      console.log('🚀 Deploying to Vercel...');
      return execCommand('vercel --prod');
    },
  },
  netlify: {
    name: 'Netlify',
    detect: () => fs.existsSync('netlify.toml') || fs.existsSync('deploy/netlify.toml'),
    deploy: async () => {
      console.log('🚀 Deploying to Netlify...');
      return execCommand('netlify deploy --prod');
    },
  },
  railway: {
    name: 'Railway',
    detect: () => fs.existsSync('railway.json') || fs.existsSync('deploy/railway.json'),
    deploy: async () => {
      console.log('🚀 Deploying to Railway...');
      return execCommand('railway up');
    },
  },
  render: {
    name: 'Render',
    detect: () => fs.existsSync('render.yaml') || fs.existsSync('deploy/render.yaml'),
    deploy: async () => {
      console.log('🚀 Deploying to Render...');
      console.log('Please deploy through Render Dashboard or use render-cli');
      return { success: true, message: 'Manual deployment required' };
    },
  },
  docker: {
    name: 'Docker',
    detect: () => fs.existsSync('Dockerfile'),
    deploy: async () => {
      console.log('🚀 Building Docker image...');
      
      const imageName = 'emscale-cms:latest';
      
      await execCommand(`docker build -t ${imageName} .`);
      console.log('✅ Docker image built successfully');
      
      console.log('\nTo run the container:');
      console.log(`docker run -p 3000:3000 ${imageName}`);
      
      return { success: true, message: 'Docker image built' };
    },
  },
};

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ success: false, error: error.message, stderr });
        return;
      }
      resolve({ success: true, stdout, stderr });
    });
  });
}

async function detectPlatform() {
  console.log('🔍 Detecting deployment platform...\n');
  
  for (const [key, platform] of Object.entries(platforms)) {
    if (platform.detect()) {
      console.log(`✅ Detected: ${platform.name}`);
      return key;
    }
  }
  
  console.log('❓ No specific platform detected. Available options:');
  Object.keys(platforms).forEach(key => {
    console.log(`  - ${key}`);
  });
  
  return null;
}

async function runPreflightChecks() {
  console.log('\n🔧 Running preflight checks...\n');
  
  const checks = [
    {
      name: 'Node.js version',
      check: async () => {
        const result = await execCommand('node --version');
        return result.success;
      },
    },
    {
      name: 'Dependencies installed',
      check: () => fs.existsSync('node_modules'),
    },
    {
      name: 'Build successful',
      check: async () => {
        try {
          await execCommand('npm run build');
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Environment variables',
      check: () => fs.existsSync('.env.local') || process.env.NODE_ENV === 'production',
    },
  ];
  
  for (const { name, check } of checks) {
    process.stdout.write(`  Checking ${name}... `);
    const result = typeof check === 'function' ? await check() : check;
    console.log(result ? '✅' : '❌');
    
    if (!result) {
      console.error(`\n❌ Preflight check failed: ${name}`);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All preflight checks passed\n');
}

async function deploy(platformKey) {
  const platform = platforms[platformKey];
  
  if (!platform) {
    console.error(`❌ Unknown platform: ${platformKey}`);
    console.log('\nAvailable platforms:');
    Object.keys(platforms).forEach(key => {
      console.log(`  - ${key}`);
    });
    process.exit(1);
  }
  
  console.log(`\n🚀 Deploying to ${platform.name}...\n`);
  
  try {
    const result = await platform.deploy();
    
    if (result.success) {
      console.log(`\n✅ Successfully deployed to ${platform.name}!`);
      if (result.stdout) {
        console.log(result.stdout);
      }
    } else {
      console.error(`\n❌ Deployment failed: ${result.error}`);
      if (result.stderr) {
        console.error(result.stderr);
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Deployment error:`, error);
    process.exit(1);
  }
}

async function main() {
  console.log(`
╔════════════════════════════════════════╗
║   Emscale CMS - Deployment Tool       ║
╚════════════════════════════════════════╝
  `);
  
  const args = process.argv.slice(2);
  const platformArg = args[0];
  
  // Skip preflight checks if --skip-checks flag is present
  if (!args.includes('--skip-checks')) {
    await runPreflightChecks();
  }
  
  let platform = platformArg;
  
  if (!platform || platform.startsWith('--')) {
    platform = await detectPlatform();
    
    if (!platform) {
      console.log('\nUsage: node scripts/deploy.js [platform] [options]');
      console.log('\nPlatforms: vercel, netlify, railway, render, docker');
      console.log('\nOptions:');
      console.log('  --skip-checks    Skip preflight checks');
      process.exit(1);
    }
  }
  
  await deploy(platform);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { deploy, detectPlatform, runPreflightChecks };




