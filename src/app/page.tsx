const imageURLs = [
  "https://utfs.io/f/vO3Q1z5KV9G7dJOAquHtM3IUvF9xnE2upjYzsK1lroAN54mO",
  "https://utfs.io/f/vO3Q1z5KV9G7jlfvGj8uswlPNz5Ue3bX8rvkdx6KDtCYSmMa",
  "https://utfs.io/f/vO3Q1z5KV9G7ZeFMjxE3IlUcfkSjp7V4zLbXnsHrPveqGihD",
  "https://utfs.io/f/vO3Q1z5KV9G7kWbsVwCl5eE036FK2ztnLIDUXA89cm4vYRdj",
];

const mockImages = imageURLs.map((url, index) => ({
  id: index + 1,
  url,
}))

export default function HomePage() {
  return (
    <main className="">
      <div className="flex flex-wrap gap-4">
        {[...mockImages, ...mockImages, ...mockImages].map((image) => (
          <div key={image.id} className="w-48">
            <img src={image.url} />
          </div>
        ))}
      </div>
    </main>
  );
}
