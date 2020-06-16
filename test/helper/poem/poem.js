import '../initial';
import sequelize from '../../../app/lib/db';
import { Poem } from '../../../app/plugin/poem/app/model';

const run = async () => {
  await Poem.sync();
  await Poem.bulkCreate([
    {
      title: '生查子·元夕',
      author: '欧阳修',
      content:
        '去年元夜时/花市灯如昼/月上柳梢头/人约黄昏后|今年元夜时/月与灯依旧/不见去年人/泪湿春衫袖',
      dynasty: '宋代',
      image: 'http://yanlan.oss-cn-shenzhen.aliyuncs.com/gqmgbmu06yO2zHD.png'
    },
    {
      title: '临江仙·送钱穆父',
      author: '苏轼',
      content:
        '一别都门三改火/天涯踏尽红尘/依然一笑作春温/无波真古井/有节是秋筠|惆怅孤帆连夜发/送行淡月微云/尊前不用翠眉颦/人生如逆旅/我亦是行人',
      dynasty: '宋代',
      image: 'http://yanlan.oss-cn-shenzhen.aliyuncs.com/gqmgbmu06yO2zHD.png'
    },
    {
      title: '春望词四首',
      author: '薛涛',
      content:
        '花开不同赏/花落不同悲/欲问相思处/花开花落时/揽草结同心/将以遗知音/春愁正断绝/春鸟复哀吟/风花日将老/佳期犹渺渺/不结同心人/空结同心草/那堪花满枝/翻作两相思/玉箸垂朝镜/春风知不知',
      dynasty: '唐代',
      image: 'http://yanlan.oss-cn-shenzhen.aliyuncs.com/gqmgbmu06yO2zHD.png'
    },
    {
      title: '长相思',
      author: '纳兰性德',
      content:
        '山一程/水一程/身向榆关那畔行/夜深千帐灯|风一更/雪一更/聒碎乡心梦不成/故园无此声',
      dynasty: '清代',
      image: 'http://yanlan.oss-cn-shenzhen.aliyuncs.com/gqmgbmu06yO2zHD.png'
    },
    {
      title: '离思五首·其四',
      author: '元稹',
      content: '曾经沧海难为水/除却巫山不是云/取次花丛懒回顾/半缘修道半缘君',
      dynasty: '唐代',
      image: 'http://yanlan.oss-cn-shenzhen.aliyuncs.com/gqmgbmu06yO2zHD.png'
    },
    {
      title: '浣溪沙',
      author: '晏殊',
      content:
        '一曲新词酒一杯/去年天气旧亭台/夕阳西下几时回|无可奈何花落去/似曾相识燕归来/小园香径独徘徊',
      dynasty: '宋代',
      image: 'http://yanlan.oss-cn-shenzhen.aliyuncs.com/gqmgbmu06yO2zHD.png'
    },
    {
      title: '浣溪沙',
      author: '纳兰性德',
      content:
        '残雪凝辉冷画屏/落梅横笛已三更/更无人处月胧明|我是人间惆怅客/知君何事泪纵横/断肠声里忆平生',
      dynasty: '清代',
      image: 'http://yanlan.oss-cn-shenzhen.aliyuncs.com/gqmgbmu06yO2zHD.png'
    }
  ]);
  setTimeout(() => {
    sequelize.close();
  }, 500);
};

run();
