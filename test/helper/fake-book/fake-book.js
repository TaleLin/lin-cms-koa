import '../initial';
import sequelize from '../../../app/lib/db';
import { Book } from '../../../app/model/book';

const run = async () => {
  await Book.bulkCreate([
    {
      title: '深入理解计算机系统',
      author: 'Randal E.Bryant',
      summary:
        '从程序员的视角，看计算机系统！\n本书适用于那些想要写出更快、更可靠程序的程序员。通过掌握程序是如何映射到系统上，以及程序是如何执行的，读者能够更好的理解程序的行为为什么是这样的，以及效率低下是如何造成的。',
      image: 'https://img3.doubanio.com/lpic/s1470003.jpg'
    },
    {
      title: 'C程序设计语言',
      author: '（美）Brian W. Kernighan',
      summary:
        '在计算机发展的历史上，没有哪一种程序设计语言像C语言这样应用广泛。本书原著即为C语言的设计者之一Dennis M.Ritchie和著名计算机科学家Brian W.Kernighan合著的一本介绍C语言的权威经典著作。',
      image: 'https://img3.doubanio.com/lpic/s1106934.jpg'
    }
  ]);
  setTimeout(() => {
    sequelize.close();
  }, 500);
};

run();
