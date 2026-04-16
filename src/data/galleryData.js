const categories = ['Vector', 'Clipart', 'Festival', 'Flower', 'Shape']

const toTitle = (filename) =>
  filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const getFileName = (path) => path.split('/').pop() || path

const randomizeItems = (items) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const toKeywordTokens = (title) =>
  title
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

const buildCategoryItems = (category, assetsMap) => {
  return Object.entries(assetsMap)
    .map(([path, src], index) => {
      const fileName = getFileName(path)
      const title = toTitle(fileName)

      return {
        id: `${category.toLowerCase()}-${fileName}-${index + 1}`,
        title,
        src,
        description: `${title} high quality transparent PNG resource for creative projects.`,
        category,
        keywords: [
          category.toLowerCase(),
          'png',
          'transparent',
          'gallery',
          'pngwale',
          'design resource',
          ...toKeywordTokens(title),
        ],
        fileType: fileName.split('.').pop()?.toUpperCase() || 'PNG',
        license: 'Free for personal and commercial use with attribution to PNGWALE.',
      }
    })
}

const buildAlphabetItems = (assetsMap) => {
  return Object.entries(assetsMap).map(([path, src], index) => {
    const fileName = getFileName(path)
    const title = toTitle(fileName)

    return {
      id: `alphabet-${fileName}-${index + 1}`,
      title,
      src,
      description: `${title} transparent PNG alphabet resource for creative projects.`,
      category: 'Alphabet',
      keywords: [
        'alphabet',
        'letter',
        'text',
        'png',
        'transparent',
        'gallery',
        'pngwale',
        ...toKeywordTokens(title),
      ],
      fileType: fileName.split('.').pop()?.toUpperCase() || 'PNG',
      license: 'Free for personal and commercial use with attribution to PNGWALE.',
    }
  })
}

const buildNumberItems = (assetsMap) => {
  return Object.entries(assetsMap).map(([path, src], index) => {
    const fileName = getFileName(path)
    const title = toTitle(fileName)

    return {
      id: `number-${fileName}-${index + 1}`,
      title,
      src,
      description: `${title} transparent PNG number resource for creative projects.`,
      category: 'Numbers',
      keywords: [
        'numbers',
        'number',
        'digits',
        'counting',
        'png',
        'transparent',
        'gallery',
        'pngwale',
        ...toKeywordTokens(title),
      ],
      fileType: fileName.split('.').pop()?.toUpperCase() || 'PNG',
      license: 'Free for personal and commercial use with attribution to PNGWALE.',
    }
  })
}

const vectorAssets = import.meta.glob('../assets/Vector/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const clipartAssets = import.meta.glob('../assets/Clipart/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const festivalAssets = import.meta.glob('../assets/Festival/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const flowerAssets = import.meta.glob('../assets/Flower/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const shapeAssets = import.meta.glob('../assets/Shape/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const alphabetAssets = import.meta.glob('../assets/Alphabet/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const numberAssets = import.meta.glob('../assets/Numbers/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

export const allCategories = ['All', ...categories]

export const categoryRoutes = {
  All: '/',
  Vector: '/vector',
  Clipart: '/clipart',
  Festival: '/festival',
  Flower: '/flower',
  Shape: '/shape',
}

export const slugToCategory = {
  vector: 'Vector',
  clipart: 'Clipart',
  festival: 'Festival',
  flower: 'Flower',
  shape: 'Shape',
}

export const galleryItems = randomizeItems([
  ...buildCategoryItems('Vector', vectorAssets),
  ...buildCategoryItems('Clipart', clipartAssets),
  ...buildCategoryItems('Festival', festivalAssets),
  ...buildCategoryItems('Flower', flowerAssets),
  ...buildCategoryItems('Shape', shapeAssets),
  ...buildAlphabetItems(alphabetAssets),
  ...buildNumberItems(numberAssets),
])
