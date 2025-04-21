export interface BlogPost {
  title: string;
  slug: string;
  date: string;
  summary: string;
  content: string;
  published: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    title: "OurChants v2 - Welcome + Survey",
    slug: "welcome",
    date: "2024-04-15",
    summary: "An introduction to OurChants and our mission to preserve sacred chants.",
    content: `I'm Ford Prior—a software engineer and dad of three. After an ayahuasca ceremony in Costa Rica, I became obsessed with remembering the real songs I heard: icaros, sung by shamans, raw and powerful. Not Spotify loops; the real deal.

I hunted them down and found a broken site called OurChants.org. The site was full of field recordings—unpolished, intimate, sacred—but riddled with errors. I tracked down the original files, rebuilt the site with a Spotify-style interface on AWS, and brought 200 chants back online in a searchable format.

If that resonates, I'd love your input to guide feature development:
👉 Take this [5 question survey](/survey.html)

Your voice helps shape what comes next.`,
    published: true
  }
]; 