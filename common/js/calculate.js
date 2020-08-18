/**
 * @param {Object} formData -表单数据
 * @param {Object} rule	-计算规则
 */
function calculateTo(formData, rule) {
	let result = null
	// try {
	let data = JSON.parse(JSON.stringify(formData))
	let rules = JSON.parse(JSON.stringify(rule))
	let calculate = function(rule, result) {
		Object.keys(rules).forEach((operator, index) => {
			switch (operator) {
				case 'add':
					let arr = rule[operator]
					arr.forEach(item => {
						if (item.valueType === 'field') {
							if (item.dataType === 'number') {
								result += Number(data[item.value])
							} else {
								result += data[item.value]
							}
						} else if (item.valueType === 'value') {
							if (item.dataType === 'number') {
								result += Number(item.value)
							} else {
								result += item.value
							}
						}
					})
					return result
					break;
				case 'filter':
					let value = rules[operator]['value']
					let ruleType = rules[operator]['ruleType']
					switch (ruleType) {
						case 'eq':
							if (rules[operator].originArray === "valueList") {
								// 符合条件的数组的长度
								let length = Object.values(data).filter(item => item === rules[operator].value).length
								rules[operator].result.forEach(item => {
									let ruleArr = Object.keys(item).filter(item => item !== 'value')
									let amount = 0
									ruleArr.forEach(key => {
										switch (key) {
											case 'eq':
												if (length === item[key]) {
													amount++
												}
												break;
											case 'le':
												if (length <= item[key]) {
													amount++
												}
												break;
											case 'ge':
												if (length >= item[key]) {
													amount++
												}
												break;
											case 'lt':
												if (length < item[key]) {
													amount++
												}
												break;
											case 'gt':
												if (length > item[key]) {
													amount++
												}
												break;
										}
									})
									if (amount >= ruleArr.length) {
										result = item.value
										return result
									}
								})
							}
							break;
					}
					return result
					break;
			}
		})
		let text = ''
		if (rules.textRange && Array.isArray(rules.textRange)) {
			rules.textRange.forEach(item => {
				let amount = 0
				let ruleArr = Object.keys(item).filter(item => item !== 'value')
				ruleArr.forEach(key => {
					switch (key) {
						case 'eq':
							if (result === item[key]) {
								amount++
							}
							break;
						case 'le':
							if (result <= item[key]) {
								amount++
							}
							break;
						case 'ge':
							if (result >= item[key]) {
								amount++
							}
							break;
						case 'lt':
							if (result < item[key]) {
								amount++
							}
							break;
						case 'gt':
							if (result > item[key]) {
								amount++
							}
							break;
					}
				})
				if (amount >= ruleArr.length) {
					text = item.value
					// return result
				}
			})
		}
		console.log(result, text)
		if (text) {
			result = text
		}
		return result
	}
	return calculate(rule, result)
	// } catch (e) {
	// 	//TODO handle the exception
	// 	console.warn(e)
	// 	console.warn('请检查传入的参数格式是否正确', ...arguments)
	// }
}

export default calculateTo
