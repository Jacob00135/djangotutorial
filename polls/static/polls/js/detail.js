(() => {
    'use strict';

    // region Main
    const colorSchemeTransition = false;
    const colorSchemeTransitionTime = '.5s';
    const isResultPage = getIsResultPageVariable();

    readColorStyleData().then((colorStyleData) => {
        if (colorStyleData === null) {
            console.log('应用随机页面配色方案失败，将使用默认配色方案');
            return undefined;
        }
        colorStyleData = updateColorStyleData(colorStyleData);
        applyColorStyle(colorStyleData);
    });

    if (isResultPage) {
        switchToResultPage();
    } else {
        alertErrorMessage();
    }

    document.getElementById('choice_form').addEventListener('submit', submitChoiceForm);
    // endregion

    function getIsResultPageVariable() {
        const node = document.getElementById('is_result_page');
        return node.getAttribute('data-is-result-page') === '1';
    }

    function readColorStyleData() {
        const url = document.getElementById('main').getAttribute('data-color-style-data-url');
        return fetch(url).then((response) => {
            if (!response.ok) {
                console.log(`请求文件失败：状态码为${response.status}。请求网址为${url}`);
                return null;
            }
            return response.json();
        }, (error) => {
            console.log(`请求文件失败：请求网址为${url}`);
            console.log(error);
            return null;
        });
    }

    function updateColorStyleData(styleObject) {
        const baseH = randomInt(0, 365);
        const baseS = randomInt(5, 30);
        const baseL = randomInt(5, 30);
        const deltaH = 30;
        let value;
        console.log('打印随机生成的页面配色方案');

        // 选项背景颜色
        value = `hsl(${baseH}, ${baseS}%, ${baseL}%)`;
        styleObject['choiceBackgroundColor']['value'] = value;
        console.log('选项背景颜色', value);

        // 选项背景颜色 - hover
        if (isResultPage) {
            styleObject['choiceHoverBackgroundColor']['value'] = styleObject['choiceBackgroundColor']['value'];
        } else {
            value = `hsl(${baseH}, ${baseS}%, ${baseL + 5}%)`;
            styleObject['choiceHoverBackgroundColor']['value'] = value;
        }
        console.log('选项背景颜色 - hover', value);

        // 选项投票百分比进度条的背景颜色
        value = `hsl(${(baseH +60) % 360}, ${baseS + 5}%, ${baseL - 5}%)`;
        styleObject['choiceVotePercentProgressBackgroundColor']['value'] = value;
        console.log('选项投票百分比进度条的背景颜色', value);

        // 选项边框颜色
        value = `hsl(${baseH}, ${baseS}%, ${baseL + 5}%)`;
        styleObject['choiceBorderColor']['value'] = value;
        console.log('选项边框颜色 - hover', value);

        // 标题背景颜色
        value = `hsl(${(baseH + deltaH) % 360}, ${baseS + 5}%, ${baseL + 10}%)`;
        styleObject['titleBackgroundColor']['value'] = value;
        console.log('标题背景颜色', value);

        // 按钮背景颜色
        value = `hsl(${(baseH + deltaH * 2) % 360}, ${baseS + 10}%, ${baseL + 10}%)`;
        styleObject['submitBackgroundColor']['value'] = value;
        console.log('按钮背景颜色', value);

        // 按钮背景颜色 - hover
        value = `hsl(${(baseH + deltaH * 2) % 360}, ${baseS + 15}%, ${baseL + 20}%)`;
        styleObject['submitHoverBackgroundColor']['value'] = value;
        console.log('按钮背景颜色 - hover', value);

        // 选项字体颜色
        console.log('--------------------------------------------------------------------------------');
        let choiceColorH = randomInt(0, 360);
        document.querySelectorAll('#choice_list > .choice-item .text').forEach((node) => {
            const color = `hsl(${choiceColorH}, 75%, 75%)`;
            node.style.color = color;
            console.log(node.textContent, color);
            choiceColorH = (choiceColorH + randomInt(30, 60)) % 360;
        });
        console.log('--------------------------------------------------------------------------------');

        return styleObject;
    }

    function applyColorStyle(style) {
        const cssRuleArray = [];
        for (let k in style) {
            let v = style[k];
            let cssRule;
            if (colorSchemeTransition) {
                cssRule = `${v['cssSelector']} {\n    ${v['key']}: ${v['value']};\n    transition: all ${colorSchemeTransitionTime};\n}`;
            } else {
                cssRule = `${v['cssSelector']} {\n    ${v['key']}: ${v['value']}\n}`;
            }
            cssRuleArray.push(cssRule);
        }

        const oldStyleElement = document.getElementById('auto_style');
        if (oldStyleElement !== null) {
            oldStyleElement.remove();
        }

        const fatherDiv = document.createElement('div');
        fatherDiv.innerHTML  = `<style id="auto_style">${cssRuleArray.join('\n')}</style>`;
        document.body.appendChild(fatherDiv.children[0]);
    }

    function alertErrorMessage() {
        const em = document.getElementById('error_message');
        if (em !== null) {
            alert(em.innerHTML);
        }
    }

    function switchToResultPage() {
        document.querySelectorAll('#choice_list > .choice-item').forEach((e) => {
            const votePercentProgress = e.querySelector('.vote-percent-progress');
            const votePercent = votePercentProgress.getAttribute('data-percent');
            votePercentProgress.style.width = votePercent;
        });
    }

    function submitChoiceForm(e) {
        e.preventDefault();
        const form = e.target;
        const uuid = getUUID();
        const uuidInput = document.createElement('input');
        uuidInput.type = 'text';
        uuidInput.name = 'unique_identification';
        uuidInput.value = uuid;
        uuidInput.style.display = 'none';
        form.appendChild(uuidInput);
        form.submit();
    }
})();
