// Script tự động chấm điểm rèn luyện 

(function() {
    console.log("🚀 Bắt đầu tự động chấm điểm (Phiên bản rút gọn)...");
    
    let processedCount = 0;
    let isRunning = true;
    
    // Hàm delay - Tốc độ cao
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Tìm tất cả input theo thứ tự
    function findAllInputsOrdered() {
        const selectors = [
            'input.ant-input-number-input',
            'input[inputmode="decimal"]',
            'input[type="number"]'
        ];
        
        let allInputs = [];
        for (let selector of selectors) {
            const inputs = document.querySelectorAll(selector);
            inputs.forEach(input => {
                if (input.offsetParent !== null && !input.disabled && !allInputs.includes(input)) {
                    allInputs.push(input);
                }
            });
        }
        
        // Sắp xếp theo vị trí
        allInputs.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            return Math.abs(rectA.top - rectB.top) < 50 ? 
                rectA.left - rectB.left : rectA.top - rectB.top;
        });
        
        return allInputs;
    }
    
    // Điền vào ô input cụ thể
    async function fillInputByIndex(index, score = 20) {
        const inputs = findAllInputsOrdered();
        
        if (index >= inputs.length || index < 0) {
            console.log(`❌ Index ${index} không hợp lệ`);
            return false;
        }
        
        const targetInput = inputs[index];
        console.log(`📝 Điền vào ô ${index + 1} với điểm ${score}`);
        
        try {
            targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await delay(100); // Giảm từ 300
            
            targetInput.focus();
            await delay(50); // Giảm từ 200
            
            targetInput.value = String(score);
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            await delay(30); // Giảm từ 100
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            targetInput.blur();
            
            console.log(`✅ Hoàn thành ô ${index + 1}: "${targetInput.value}"`);
            return targetInput.value === String(score);
            
        } catch (error) {
            console.log(`❌ Lỗi ô ${index + 1}:`, error.message);
            return false;
        }
    }
    
    // Tìm các ô đánh giá chưa hoàn thành
    function findUncompletedGradingBoxes() {
        const allGradingButtons = document.querySelectorAll('span.anticon.anticon-form');
        const uncompletedBoxes = [];
        
        allGradingButtons.forEach((button, index) => {
            if (!button.offsetParent) return;
            
            const parentRow = button.closest('tr');
            if (!parentRow) return;
            
            const hasEyeIcon = parentRow.querySelector('svg[data-icon="eye"]') || 
                              parentRow.querySelector('i.anticon-eye');
            const hasCompletedText = parentRow.textContent && 
                                    parentRow.textContent.includes('Hoàn thành tốt');
            
            if (!hasEyeIcon && !hasCompletedText) {
                uncompletedBoxes.push(button);
            }
        });
        
        console.log(`🎯 Tìm thấy ${uncompletedBoxes.length} ô chưa hoàn thành`);
        return uncompletedBoxes;
    }
    
    // Click element
    function clickElement(element) {
        if (!element) return false;
        
        try {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            if (typeof element.click === 'function') {
                element.click();
                return true;
            }
            
            const parentButton = element.closest('button');
            if (parentButton) {
                parentButton.click();
                return true;
            }
            
            element.dispatchEvent(new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            }));
            
            return true;
        } catch (error) {
            console.log("⚠️ Lỗi click:", error.message);
            return false;
        }
    }
    
    // Điền điểm vào các ô: 2, 16, 28, 38 (index: 1, 15, 27, 37)
    async function fillScoreInput(score = 20) {
        await delay(500); // Giảm từ 1500
        
        const indexesToFill = [1, 15, 27, 37]; // Ô 2, 16, 28, 38
        let successCount = 0;
        
        console.log("📝 Điền điểm vào ô: 2, 16, 28, 38");
        
        for (let index of indexesToFill) {
            const success = await fillInputByIndex(index, score);
            if (success) successCount++;
            await delay(50); // Giảm từ 200
        }
        
        console.log(`📊 Đã điền ${successCount}/4 ô thành công`);
        return successCount >= 2; // Thành công nếu điền được ít nhất 2 ô
    }
    
    // Tìm và click nút lưu
    function findSaveButton() {
        // Tìm button có text "Lưu và quay lại"
        const allButtons = document.querySelectorAll('button');
        
        for (let button of allButtons) {
            if (button.textContent && button.textContent.includes('Lưu và quay lại')) {
                const hasSaveIcon = button.querySelector('svg[data-icon="save"]') || 
                                   button.querySelector('i[nztype="save"]') ||
                                   button.querySelector('.anticon-save');
                
                if (hasSaveIcon && button.offsetParent !== null) {
                    return button;
                }
            }
        }
        return null;
    }
    
    // Click lưu và quay lại
    async function clickSaveAndReturn() {
        await delay(300); // Giảm từ 1000
        
        const saveButton = findSaveButton();
        if (!saveButton) {
            console.log("❌ Không tìm thấy nút lưu");
            return false;
        }
        
        const success = clickElement(saveButton);
        if (success) {
            console.log("💾 Đã click nút lưu, chờ quay về...");
            await delay(2000); // Giảm từ 4000
            
            // Kiểm tra đã quay về danh sách
            for (let i = 0; i < 3; i++) { // Giảm từ 5 lần
                await delay(800); // Giảm từ 1500
                
                const hasTable = document.querySelector('.ant-table') || document.querySelector('table');
                const hasGradingButtons = document.querySelectorAll('span.anticon.anticon-form').length > 0;
                
                if (hasTable && hasGradingButtons) {
                    console.log("✅ Đã quay về danh sách");
                    return true;
                }
            }
        }
        
        console.log("⚠️ Không thể lưu hoặc quay về");
        return false;
    }
    
    // Xử lý một ô đánh giá
    async function processGradingBox(gradingBox, index) {
        try {
            console.log(`🔄 Xử lý ô ${index + 1}...`);
            
            gradingBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await delay(300); // Giảm từ 1000
            
            const clickSuccess = clickElement(gradingBox);
            if (!clickSuccess) {
                console.log("⚠️ Không click được ô đánh giá");
                return false;
            }
            
            await delay(800); // Giảm từ 2000
            
            const fillSuccess = await fillScoreInput(20);
            if (!fillSuccess) {
                console.log("⚠️ Không điền được điểm");
                return false;
            }
            
            const saveSuccess = await clickSaveAndReturn();
            if (!saveSuccess) {
                console.log("⚠️ Không lưu được");
                return false;
            }
            
            processedCount++;
            console.log(`✅ Hoàn thành ô ${index + 1}. Tổng: ${processedCount}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Lỗi ô ${index + 1}:`, error.message);
            return false;
        }
    }
    
    // Quy trình chính
    async function startAutoGrading() {
        console.log("🎯 Bắt đầu quy trình...");
        
        while (isRunning) {
            try {
                const uncompletedBoxes = findUncompletedGradingBoxes();
                
                if (uncompletedBoxes.length === 0) {
                    console.log("🎉 Hoàn thành tất cả!");
                    break;
                }
                
                console.log(`📋 Còn ${uncompletedBoxes.length} ô cần xử lý`);
                
                // Xử lý ô đầu tiên
                const success = await processGradingBox(uncompletedBoxes[0], 0);
                
                if (success) {
                    await delay(800); // Giảm từ 2000
                } else {
                    console.log("⏭️ Bỏ qua ô này");
                    await delay(400); // Giảm từ 1000
                }
                
            } catch (error) {
                console.error("❌ Lỗi quy trình:", error);
                await delay(1500); // Giảm từ 3000
            }
        }
        
        console.log(`🏁 Kết thúc. Đã xử lý ${processedCount} ô.`);
    }
    
    // Điều khiển
    window.stopAutoGrading = function() {
        isRunning = false;
        console.log("⛔ Đã dừng");
    };
    
    window.resumeAutoGrading = function() {
        if (!isRunning) {
            isRunning = true;
            console.log("▶️ Tiếp tục");
            startAutoGrading();
        }
    };
    
    window.getStatus = function() {
        console.log(`📊 Trạng thái: ${isRunning ? 'Đang chạy' : 'Đã dừng'}`);
        console.log(`📈 Đã xử lý: ${processedCount} ô`);
        console.log(`📋 Còn lại: ${findUncompletedGradingBoxes().length} ô`);
    };
    
    // Debug
    window.testFillInputs = function() {
        console.log("🧪 Test điền ô 2, 16, 28, 38...");
        fillScoreInput(20);
    };
    
    window.showAllInputs = function() {
        const inputs = findAllInputsOrdered();
        console.log(`🔍 Tìm thấy ${inputs.length} ô input`);
        inputs.forEach((input, index) => {
            console.log(`Ô ${index + 1} (index ${index}): ${input.tagName} - value: "${input.value}"`);
        });
    };
    
    // Bắt đầu
    console.log("✅ Script đã sẵn sàng!");
    console.log("📋 Lệnh điều khiển:");
    console.log("   - startAutoGrading(): Bắt đầu tự động");
    console.log("   - stopAutoGrading(): Dừng lại");
    console.log("   - getStatus(): Xem trạng thái");
    console.log("   - testFillInputs(): Test điền điểm");
    console.log("   - showAllInputs(): Xem tất cả ô input");
    
    // Tự động bắt đầu sau 1 giây
    setTimeout(() => {
        if (isRunning) {
            console.log("🚀 Tự động bắt đầu...");
            startAutoGrading();
        }
    }, 1000); // Giảm từ 3000
    
})();


