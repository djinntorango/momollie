import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative h-96 w-full mb-8">
          <Image
            src="/placeholder-about-hero.jpg"
            alt="Momollie Team"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <h1 className="text-4xl font-bold text-center mb-6">About Momollie</h1>
        <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
          We&apos;re passionate about providing high-quality products for your pets and babies,
          making your life easier and more enjoyable.
        </p>
      </section>

      {/* Our Story */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Our Story</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-gray-600 mb-4">
              Founded in 2024, Momollie was born from a simple idea: to create a one-stop
              shop for all your pet and baby needs. We understand that both pets and babies
              are precious members of your family, and they deserve the best care and products.
            </p>
            <p className="text-gray-600">
              Our mission is to provide high-quality, safe, and innovative products that make
              your life easier while ensuring the well-being of your loved ones. We carefully
              curate our selection to bring you only the best products from trusted brands.
            </p>
          </div>
          <div className="relative h-64">
            <Image
              src="/placeholder-about-story.jpg"
              alt="Our Story"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Quality</h3>
            <p className="text-gray-600">
              We never compromise on quality. Every product in our store meets our
              rigorous standards for safety and durability.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Customer Care</h3>
            <p className="text-gray-600">
              Your satisfaction is our priority. We&apos;re here to help you find the perfect
              products for your needs.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Innovation</h3>
            <p className="text-gray-600">
              We constantly seek out new and innovative products to make your life easier
              and more enjoyable.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Meet Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((member) => (
            <div key={member} className="text-center">
              <div className="relative h-64 w-64 mx-auto mb-4">
                <Image
                  src={`/placeholder-team-${member}.jpg`}
                  alt={`Team Member ${member}`}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-bold">Team Member {member}</h3>
              <p className="text-gray-600">Position</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 