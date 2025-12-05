# Math Tutor

Math Tutor is an AI-powered assistant designed to facilitate Socratic learning. Unlike traditional AI models or calculators that provide direct answers, Math Tutor takes a math problem as input, analyzes it, and guides the user through the solution process. It asks helpful questions and provides hints to encourage the user to solve the problem themselves, fostering deep understanding rather than just giving the final result.

## Development History

Our journey to build an effective Socratic math tutor involved several experiments:

1.  **Fine-tuning Llama-3.2-1B on OpenMathInstruct-1**: 
    - We started by fine-tuning the Llama-3.2-1B model using the `nvidia/OpenMathInstruct-1` dataset from HuggingFace.
    - **Result**: The model achieved very low accuracy and did not perform well in guiding users.

2.  **Fine-tuning Llama-3.2-3B**:
    - We then tried the larger Llama-3.2-3B model on the same dataset.
    - **Result**: Achieved comparatively better accuracy than the 1B model, but it still did not meet our expectations for a high-quality tutor.

3.  **Scaling to Bigger Models**:
    - We attempted to use even larger models to improve performance.
    - **Result**: These attempts failed as the session crashed due to high RAM occupation, making them unfeasible for our current resources.

4.  **Prompt Tuning Gemini 2.5 (Successful Approach)**:
    - Finally, we switched to prompt tuning using the Gemini 2.5 model.
    - **Result**: This clearly met our expectations. The model successfully provided step-by-step guidance, refused to reveal direct answers, and effectively asked relevant questions to help users solve problems on their own.

## Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
