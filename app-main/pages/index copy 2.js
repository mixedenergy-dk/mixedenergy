import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Wrapper for the banner with full width and background color */}
      <div className="w-full" style={{ backgroundColor: '#212121' }}>
        <div
          className="w-full hidden lg:block"
          style={{
            height: '50vh', // This sets the height to 50% of the viewport height
            backgroundImage: "url('/images/Color-logo-with-background.png')",
            backgroundSize: 'contain', // Ensures the entire image is visible
            backgroundPosition: 'center', // Centers the image
            backgroundRepeat: 'no-repeat', // Prevents the image from repeating
          }}
        ></div>
      </div>

      {/* Headline above the cards */}
      <div className="w-full text-center py-6">
        <h1 className="text-3xl font-bold">Bland selv mix</h1>
      </div>

      <div className="flex flex-wrap justify-center p-4 max-w-screen-xl mx-auto">
        {/* First set of 4 cards */}
        <Link href="/products/mixed-any">
          <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
              <div className="w-full h-60"> {/* Set a height for the image container */} 
                <img
                  src="/images/thunder-punch-energy.jpg"
                  alt="Mixed Any"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-grow">
                <h2 className="text-xl font-bold">Mixed Bland Selv</h2>
                <p className="text-gray-700">Bland Red Bull, Monster og Booster i en kasse</p>
              </div>
            </div>
          </a>
        </Link>

        <Link href="/products/mixed-red-bulls">
          <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
              <div className="w-full h-60">
                <img
                  src="/images/volt-burst-energy.jpg"
                  alt="Mixed Red Bulls"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-grow">
                <h2 className="text-xl font-bold">Mixed Red Bulls</h2>
                <p className="text-gray-700">Bland Red Bull varianter i en kasse</p>
              </div>
            </div>
          </a>
        </Link>

        <Link href="/products/mixed-monsters">
          <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
              <div className="w-full h-60">
                <img
                  src="/images/iceblast-energy.jpg"
                  alt="Mixed Monsters"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-grow">
                <h2 className="text-xl font-bold">Mixed Monsters</h2>
                <p className="text-gray-700">Bland Monster varianter i en kasse</p>
              </div>
            </div>
          </a>
        </Link>

        <Link href="/products/mixed-booster">
          <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
              <div className="w-full h-60">
                <img
                  src="/images/booster-attack-energy.jpg"
                  alt="Mixed Booster"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-grow">
                <h2 className="text-xl font-bold">Mixed Booster</h2>
                <p className="text-gray-700">Bland Booster varianter i en kasse</p>
              </div>
            </div>
          </a>
        </Link>

        {/* Insert the headline "Vi Blander For Dig" here */}
        <div className="w-full text-center py-6">
          <h1 className="text-2xl font-bold">Vi Blander For Dig</h1>
        </div>

{/* New 4 cards with updated links */}
<Link href="/products/mixed-monster">
  <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
      <div className="w-full h-60">
        <img
          src="/images/iceblast-energy.jpg"
          alt="Mixed Monsters"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold">Monster Mix</h2>
        <p className="text-gray-700">Vi Blander Forskellige Monster Varianter i en kasse for dig</p>
      </div>
    </div>
  </a>
</Link>

<Link href="/products/mixed-any">
  <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
      <div className="w-full h-60">
        <img
          src="/images/thunder-punch-energy.jpg"
          alt="Mixed Bland Selv"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold">Blandet Mix</h2>
        <p className="text-gray-700">Vi Blander Forskellige Red Bull, Monster og Booster Varianter i en kasse for dig</p>
      </div>
    </div>
  </a>
</Link>

<Link href="/products/mixed-red-bulls">
  <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
      <div className="w-full h-60">
        <img
          src="/images/volt-burst-energy.jpg"
          alt="Mixed Red Bulls"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold">Red Bull Mix</h2>
        <p className="text-gray-700">Vi Blander Forskellige Red Bull Varianter i en kasse for dig</p>
      </div>
    </div>
  </a>
</Link>

<Link href="/products/mixed-booster">
  <a className="flex flex-col w-full md:w-1/2 lg:w-1/4 p-2">
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
      <div className="w-full h-60">
        <img
          src="/images/booster-attack-energy.jpg"
          alt="Mixed Booster"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-bold">Booster Mix</h2>
        <p className="text-gray-700">Vi Blander Forskellige Booster Varianter i en kasse for dig</p>
      </div>
    </div>
  </a>
</Link>


      </div>
    </div>
  );
}
