<?php
/*
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
$allImages[$_GET['dirname']] = [];
if (isset($_GET['dirname']) && $_GET['dirname'] !== '') {
    $dir = new DirectoryIterator(basename($_GET['dirname']));
    $authorizedExtensions = ['png', 'jpg', 'jpeg', 'gif'];
    foreach ($dir as $fileinfo) {
        if (! $fileinfo->isDir() && ! $fileinfo->isDot()) {
            if (in_array(strtolower($fileinfo->getExtension()), $authorizedExtensions)) {
                $allImages[$_GET['dirname']][] = $fileinfo->getFilename();
            }
        }
    }

    header('Content-type: application/json');
    echo json_encode($allImages);
}
