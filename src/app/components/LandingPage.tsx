import Image from "next/image";

import image1 from "public/image1.jpg";
import image2 from "public/image2.jpg";

export default function LandingPage() {
  return (
    <div>
      <div className="flex w-full justify-between">
        <div>
          <h1 className="mb-4 text-3xl font-normal md:text-6xl">Photograph</h1>
          <h2 className="w-48 text-lg font-light leading-6">
            A photo gallery app made with Next.js
          </h2>
        </div>
      </div>
      <div className="fit absolute bottom-0 right-0 flex items-end justify-end gap-2">
        <div className="h-[420px] w-fit md:w-96">
          <Image
            className="h-full w-full rounded-tl-3xl object-cover"
            src={image2}
            alt="image2"
          ></Image>
        </div>
        <div className="hidden w-96 md:block">
          <Image
            className="h-full w-full rounded-tl-3xl object-cover"
            src={image1}
            alt="image1"
          ></Image>
        </div>
      </div>
    </div>
  );
}
