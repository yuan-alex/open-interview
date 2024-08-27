const animals = [
  "Elephant",
  "Giraffe",
  "Kangaroo",
  "Penguin",
  "Cheetah",
  "Octopus",
  "Hippopotamus",
  "Falcon",
  "Sloth",
  "Chimpanzee",
  "Narwhal",
  "Red Panda",
  "Koala",
  "Sea Turtle",
  "Armadillo",
  "Bison",
  "Platypus",
  "Lemur",
  "Ostrich",
  "Manatee",
];

export function getRandomAnimalName() {
  const randomIndex = Math.floor(Math.random() * animals.length);
  return animals[randomIndex];
}
