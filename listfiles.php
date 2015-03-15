<?php
/*
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
//@todo quick and dirty. Should use *Iterator from SPL

$allImages = [];
if (isset($_GET['dirname']) && $_GET['dirname'] !== '') {
    $dirName = $_GET['dirname'];
    if (false === strpos($dirName, ".") && is_dir($dirName)) {
        if ($handle = opendir($dirName)) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry != "." && $entry != "..") {
                    $allImages[$dirName][] = $entry;
                }
            }
            closedir($handle);
        }
    } else {
        $allImages[$dirName] = [];
    }
}

header('Content-type: application/json');
echo json_encode($allImages);
