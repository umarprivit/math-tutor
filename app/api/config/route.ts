import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'config.json');

export async function GET() {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf-8');
        const config = JSON.parse(data);
        return NextResponse.json(config);
    } catch (error) {
        // If file doesn't exist, return empty config
        return NextResponse.json({ backendUrl: '' });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { backendUrl } = body;

        if (typeof backendUrl !== 'string') {
            return NextResponse.json({ error: 'Invalid backendUrl' }, { status: 400 });
        }

        const config = { backendUrl };
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

        return NextResponse.json({ success: true, config });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
