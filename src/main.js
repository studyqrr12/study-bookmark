// README.md 파일을 생성합니다.

const { join } = require('path');
const { readFile, writeFile, readdir, rm, access } = require('fs/promises');

const dataDir = join(__dirname, '..', 'data');
const includeDir = join(__dirname, '..', 'include');

async function main() {

    // README.md 삭제
    try {
        await rm(join(__dirname, '..', 'README.md'));
    } catch (reason) {
        console.log('fail rm README.md')
    }

    // README.md 베이스 문자 읽기
    let text = await readFile(join(includeDir, 'BASE.md'), { encoding: 'utf-8' });
    text += '\n\n';

    // 데이터 읽기
    let files = await readdir(join(dataDir));
    files = files.filter(name => !name.startsWith('_') && name.endsWith('.json'));

    // README.md 문자열에 읽은 데이터 추가
    let file = null;
    while (file = files.shift()) {
        try {
            const title = file.substring(0, file.length - '.json'.length);
            const jsonData = JSON.parse(await readFile(join(dataDir, file), { encoding: 'utf-8' }));

            //데이터가 없을 경우 Pass
            if (jsonData.length == 0) continue;

            //제목
            //TODO: 마크다운 형식에 영향을 주는 문자가 있다면 이스케이프 처리
            text += `## ${title}`;
            text += '\n\n';

            //내용
            let row = null;
            while (row = jsonData.shift()) {
                //TODO: 마크다운 형식에 영향을 주는 문자가 있다면 이스케이프 처리
                text += `[${row.title}](${row.url})<br/>\n`;

                let tags = row.tag ?? [];
                if (tags.length) {
                    text += `TAG : ${tags.join(', ')}<br/>\n`;
                }
            }

            //구분
            text += '\n';
        } catch (reason) {
            console.log(`fail read ${file}`, reason);
        }
    }

    await writeFile(join(__dirname, '..', 'README.md'), text, { encoding: 'utf-8' });

    return 'Success';
}

main()
    .catch(reason => {
        console.error('catch', reason);
    })
    .then(data => {
        console.log('then', data);
    });